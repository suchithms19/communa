const validate = (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body, { abortEarly: false });
      
      if (error) {
        const errors = error.details.map(detail => {
          // Extract the field name from the path
          const param = detail.path[0];
          
          return {
            param,
            message: detail.message.replace(/['"]/g, ''),
            code: 'INVALID_INPUT'
          };
        });
        
        return res.status(400).json({
          status: false,
          errors
        });
      }
      
      next();
    };
  };
  
  module.exports = validate; 