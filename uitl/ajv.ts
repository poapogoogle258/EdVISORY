import Ajv from "ajv";
import ajvFormats from "ajv-formats";
// import ajvErrors from "ajv-errors";

const ajv = new Ajv({
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  allErrors: true
});

ajvFormats(ajv);
// ajvErrors(ajv, { singleError: true });

export { ajv };