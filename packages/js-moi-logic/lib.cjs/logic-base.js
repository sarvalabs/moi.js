"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
/**
 * The default fuel price used for logic interactions.
 */
const DEFAULT_FUEL_PRICE = 1;
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
class LogicBase extends js_moi_manifest_1.ElementDescriptor {
  signer;
  manifestCoder;
  constructor(manifest, signer) {
    super(manifest.elements);
    this.manifestCoder = new js_moi_manifest_1.ManifestCoder(manifest);
    this.signer = signer;
  }
  // protected isMutableCallsite(callsite: string): boolean {}
  async triggerCallsite(callsite, args, option) {
    const routine = this.getRoutineElement(callsite);
    // if (routine.data.mode === )
    //     const ix = await this.signer.execute({
    //         fuel_price: option?.fuel_price ?? DEFAULT_FUEL_PRICE,
    //         fuel_limit: option?.fuel_limit ?? 10000, // TODO: remove a hard-coded default value
    //         operations: [this.createOperationPayload(callsite, args)],
    //     });
    // return ix;
  }
}
exports.LogicBase = LogicBase;
//# sourceMappingURL=logic-base.js.map
