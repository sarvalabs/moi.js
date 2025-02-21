# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'js-moi-sdk'
copyright = '2023, Sarva Labs Inc. & MOI Protocol Developers'
author = 'Sarva Labs Inc'

# The version info for the project you're documenting, acts as replacement for
# |version| and |release|, also used in various other places throughout the
# built documents.
#
# The short X.Y version.
version = u'v0.6.0'
# The full version, including alpha/beta/rc tags.
release = u'v0.6.0'

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = ['sphinx.ext.autodoc', 'sphinx_js', 'sphinx_copybutton']
root_for_relative_js_paths = '../../'
js_source_path = [
    '../../packages/js-moi-identifiers/lib.cjs',
    '../../packages/js-moi-hdnode/lib.cjs',
    '../../packages/js-moi-bip39/lib.cjs',
    '../../packages/js-moi-wallet/lib.cjs',
    '../../packages/js-moi-signer/lib.cjs',
    '../../packages/js-moi-providers/lib.cjs/provider',
    '../../packages/js-moi-providers/lib.cjs/transport',
    '../../packages/js-moi-providers/lib.cjs/utils',
    '../../packages/js-moi-manifest/lib.cjs',
    '../../packages/js-moi-logic/lib.cjs',
    '../../packages/js-moi-utils/lib.cjs',

]
primary_domain = 'js'

templates_path = ['_templates']
exclude_patterns = []
autodoc_default_flags = ['members', 'undoc-members' ]
# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']
html_css_files = ["css/custom.css"]

# Path to the favicon file relative to the conf.py file
html_favicon = '_static/img/favicon.svg'
