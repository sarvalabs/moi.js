import { ManifestCoderFormat } from "js-moi-manifest";
import type { Signer } from "js-moi-signer";
import { CustomError, ElementType, ErrorCode, ErrorUtils, LogicState, OpType, RoutineType, type IxOp, type LogicId } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import type { CallsiteCallback, CallsiteOption, LogicCallsites, LogicDriverOption } from "./types";
import type { SimulateInteractionRequest } from "js-moi-providers";

export class LogicBase<TCallsites extends LogicCallsites = LogicCallsites> extends LogicDescriptor {
    private signer: Signer;

    public readonly endpoint: TCallsites;

    constructor(option: Omit<LogicDriverOption, "logicId"> & { logicId?: LogicId }) {
        super(option.manifest, option.logicId);

        this.signer = option.signer;
        this.endpoint = this.setupEndpoint();
    }

    private isDeployed() {
        return this.logicId != null;
    }

    private getCallsiteType(callsite: string) {
        return this.getRoutineElement(callsite).data.kind;
    }

    public isCallsiteMutable(callsite: string) {
        const kinds = [LogicState.Ephemeral, LogicState.Persistent];
        const element = this.getRoutineElement(callsite);

        return kinds.includes(element.data.mode);
    }

    public validateCallsiteOption(option?: CallsiteOption): Error | null {
        if (option == null) {
            return null;
        }

        if ("sequence" in option && (typeof option.sequence !== "number" || Number.isNaN(option.sequence) || option.sequence < 0)) {
            return new CustomError("Invalid sequence number.", ErrorCode.INVALID_ARGUMENT);
        }

        if ("simulate" in option && typeof option.simulate !== "boolean") {
            return new CustomError("Invalid simulate flag.", ErrorCode.INVALID_ARGUMENT);
        }

        return null;
    }

    private extractArgsAndOption(callsite: string, callsiteArguments: unknown[]) {
        const element = this.getRoutineElement(callsite);

        if (callsiteArguments.length < element.data.accepts.length) {
            const callsiteSignature = `Invalid number of arguments: ${callsite}(${element.data.accepts.map((accept) => `${accept.label} ${accept.type}`).join(", ")})`;
            ErrorUtils.throwArgumentError(callsiteSignature, "args", callsiteArguments);
        }

        const option = <CallsiteOption | undefined>callsiteArguments.at(element.data.accepts.length + 1);
        const args = callsiteArguments.slice(0, element.data.accepts.length);

        const error = this.validateCallsiteOption(option);

        if (error != null) {
            throw error;
        }

        return { option, args };
    }

    private createIxOperation(callsite: string, args: unknown[]): IxOp {
        let operation: IxOp;
        const calldata = this.getManifestCoder().encodeArguments(callsite, ...args);
        const callsiteType = this.getCallsiteType(callsite);

        switch (callsiteType) {
            case RoutineType.Deploy: {
                operation = {
                    type: OpType.LogicDeploy,
                    payload: {
                        manifest: this.getManifest(ManifestCoderFormat.POLO),
                        callsite,
                        calldata,
                    },
                };
                break;
            }

            case RoutineType.Invoke:
            case RoutineType.Enlist: {
                operation = {
                    type: callsiteType === RoutineType.Invoke ? OpType.LogicInvoke : OpType.LogicEnlist,
                    payload: {
                        logic_id: this.getLogicId().value,
                        callsite,
                        calldata,
                    },
                };
                break;
            }

            default: {
                ErrorUtils.throwError("Invalid routine type.", ErrorCode.INVALID_ARGUMENT);
            }
        }

        return operation;
    }

    public async createIxRequest(callsite: string, callsiteArguments: unknown[], option?: CallsiteOption) {
        const request = {
            fuel_price: option?.fuel_price ?? 1,
            operations: [this.createIxOperation(callsite, callsiteArguments)],
        };

        if (request.fuel_limit == null) {
            console.warn("Simulating interaction should not take a fuel limit.");
            console.warn("Fuel limit not provided. Using default value 1.");
            request.fuel_limit = 1;
        }

        const simulation = await this.signer.simulate(request, option?.sequence);
        // request.fuel_limit =

        // TODO: SHOULD SDK handle this? that if fuel limit is provided and it is less than the effort, it should throw an error
        if (option?.fuel_limit != null && option.fuel_limit < simulation.effort) {
            ErrorUtils.throwError(`Minimum fuel limit required for interaction is ${simulation.effort} but got ${option.fuel_limit}.`);
        }

        if (option?.fuel_limit == null) {
        }
        // if (option?.fuel_limit == null) {
        //     request.fuel_limit = simulation.effort;
        // }

        return await this.signer.getIxRequest(request, option?.sequence);
    }

    private newCallsite(callsite: string) {
        const callback: CallsiteCallback = async (...args: unknown[]) => {
            if (this.getCallsiteType(callsite) === RoutineType.Deploy && this.isDeployed()) {
                ErrorUtils.throwError(`Logic is already deployed with logic id "${this.getLogicId().value}".`);
            }

            const { option, args: callsiteArgs } = this.extractArgsAndOption(callsite, args);
            const ixRequest = await this.createIxRequest(callsite, callsiteArgs, option);
            // const calldata = this.getManifestCoder().encodeArguments(callsite, ...accept);

            if (!this.isCallsiteMutable(callsite)) {
                return;
            }

            ErrorUtils.throwError("Not implemented for mutable callsites.");
        };

        return callback;
    }

    private setupEndpoint() {
        const endpoint = {};

        for (const { ptr } of this.getCallsites().values()) {
            const element = this.getElement(ptr);

            if (element.kind !== ElementType.Routine) {
                ErrorUtils.throwError(`Element at "${ptr}" is not a valid callsite.`);
            }

            endpoint[element.data.name] = this.newCallsite(element.data.name);
        }

        return Object.freeze(endpoint as TCallsites);
    }
}
