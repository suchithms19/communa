import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => {
        const param = detail.path[0] as string; 

        return {
          param,
          message: detail.message.replace(/['"]/g, ''),
          code: 'INVALID_INPUT'
        };
      });

      res.status(400).json({
        status: false,
        errors
      });

      return; 
    }

    next();
  };
};

export default validate;
