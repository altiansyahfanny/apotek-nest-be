import { ZodIssue, ZodType } from 'zod';

export class ValidationService {
  validate<T>(zodType: ZodType<T>, data: T): T {
    return zodType.parse(data);
  }

  transformValidationResponse(response: ZodIssue[]) {
    let transformedResponse = {};

    response.forEach((item) => {
      let key = item.path[0];
      let errorMessage = item.message;

      if (!transformedResponse[key]) {
        transformedResponse[key] = { message: [] };
      }

      transformedResponse[key].message.push(errorMessage);
    });

    return transformedResponse;
  }
}
