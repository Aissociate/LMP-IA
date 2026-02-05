import { corsHeaders } from './corsHeaders.ts';

export interface ErrorResponse {
  error: string;
  details?: string;
}

export interface SuccessResponse<T = any> {
  data: T;
  message?: string;
}

export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

export function successResponse<T>(data: T, message?: string): Response {
  const response: SuccessResponse<T> = { data, message };
  return jsonResponse(response, 200);
}

export function errorResponse(error: string, details?: string, status = 400): Response {
  const response: ErrorResponse = { error, details };
  return jsonResponse(response, status);
}

export function serverErrorResponse(error: Error): Response {
  console.error('Server error:', error);
  return errorResponse('Internal server error', error.message, 500);
}

export function notFoundResponse(resource: string): Response {
  return errorResponse(`${resource} not found`, undefined, 404);
}

export function unauthorizedResponse(message = 'Unauthorized'): Response {
  return errorResponse(message, undefined, 401);
}

export function validationErrorResponse(message: string, details?: string): Response {
  return errorResponse(message, details, 422);
}
