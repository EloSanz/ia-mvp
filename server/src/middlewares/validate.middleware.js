// import Joi from 'joi'; // Not used directly, schemas are passed as parameters

export const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Datos inválidos: ' + error.details.map((d) => d.message).join(', ')
    });
  }
  req.body = value;
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Query inválida: ' + error.details.map((d) => d.message).join(', ')
    });
  }
  req.query = value;
  next();
};

export const validateParams = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.params);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros inválidos: ' + error.details.map((d) => d.message).join(', ')
    });
  }
  req.params = value;
  next();
};
