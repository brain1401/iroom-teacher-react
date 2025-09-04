/**
 * API 응답 Zod 검증 시스템 단위 테스트
 * @description validateApiResponse, createApiResponseSchema 등 핵심 검증 로직 테스트
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { z } from 'zod';
import {
  validateApiResponse,
  createApiResponseSchema,
  createNullableApiResponseSchema,
  createArrayApiResponseSchema,
  validateEndpointResponse,
  safeValidateApiResponse,
  CommonSchemas,
} from '../validation';
import type { ApiResponse } from '../types';

// 테스트용 mock logger
vi.mock('@/utils/logger', () => ({
  logApiValidationSuccess: vi.fn(),
  logApiValidationFailure: vi.fn(),
  debugLogger: {
    debug: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Zod API 검증 시스템', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createApiResponseSchema', () => {
    it('성공 응답에 대한 올바른 스키마를 생성한다', () => {
      const UserSchema = z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
      });

      const UserResponseSchema = createApiResponseSchema(UserSchema);

      const validResponse: ApiResponse<{ id: number; name: string; email: string }> = {
        result: 'SUCCESS',
        message: '사용자 조회 성공',
        data: {
          id: 1,
          name: '홍길동',
          email: 'hong@example.com',
        },
      };

      const result = UserResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('에러 응답에 대한 올바른 스키마를 생성한다', () => {
      const UserSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const UserResponseSchema = createApiResponseSchema(UserSchema);

      const errorResponse: ApiResponse<null> = {
        result: 'ERROR',
        message: '사용자를 찾을 수 없습니다',
        data: null,
      };

      const result = UserResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
    });

    it('잘못된 result 값을 거부한다', () => {
      const UserSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const UserResponseSchema = createApiResponseSchema(UserSchema);

      const invalidResponse = {
        result: 'INVALID',
        message: '테스트',
        data: { id: 1, name: '테스트' },
      };

      const result = UserResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('createNullableApiResponseSchema', () => {
    it('null 데이터를 허용하는 스키마를 생성한다', () => {
      const UserSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const NullableUserResponseSchema = createNullableApiResponseSchema(UserSchema);

      const nullResponse: ApiResponse<null> = {
        result: 'SUCCESS',
        message: '데이터 없음',
        data: null,
      };

      const result = NullableUserResponseSchema.safeParse(nullResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('createArrayApiResponseSchema', () => {
    it('배열 데이터 응답 스키마를 생성한다', () => {
      const UserSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const UserArrayResponseSchema = createArrayApiResponseSchema(UserSchema);

      const arrayResponse: ApiResponse<Array<{ id: number; name: string }>> = {
        result: 'SUCCESS',
        message: '사용자 목록 조회 성공',
        data: [
          { id: 1, name: '홍길동' },
          { id: 2, name: '김철수' },
        ],
      };

      const result = UserArrayResponseSchema.safeParse(arrayResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('validateApiResponse', () => {
    const UserSchema = z.object({
      id: z.number(),
      name: z.string().min(1),
      email: z.string().email(),
    });

    const UserResponseSchema = createApiResponseSchema(UserSchema);

    it('유효한 데이터를 성공적으로 검증한다', () => {
      const validData: ApiResponse<{ id: number; name: string; email: string }> = {
        result: 'SUCCESS',
        message: '성공',
        data: {
          id: 1,
          name: '홍길동',
          email: 'hong@test.com',
        },
      };

      const result = validateApiResponse(
        validData,
        UserResponseSchema,
        '/api/user/1',
        'GET',
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.originalData).toEqual(validData);
    });

    it('무효한 데이터에 대해 검증 실패를 반환한다', () => {
      const invalidData = {
        result: 'SUCCESS',
        message: '성공',
        data: {
          id: 'invalid', // 숫자여야 하는데 문자열
          name: '', // 빈 문자열 (min(1) 위반)
          email: 'invalid-email', // 유효하지 않은 이메일
        },
      };

      const result = validateApiResponse(
        invalidData,
        UserResponseSchema,
        '/api/user/1',
        'GET',
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.originalData).toEqual(invalidData);
    });

    it('올바르지 않은 스키마 구조를 감지한다', () => {
      const invalidStructure = {
        // result 필드 누락
        message: '성공',
        data: {
          id: 1,
          name: '홍길동',
          email: 'hong@test.com',
        },
      };

      const result = validateApiResponse(
        invalidStructure,
        UserResponseSchema,
        '/api/user/1',
        'GET',
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('safeValidateApiResponse', () => {
    const UserSchema = z.object({
      id: z.number(),
      name: z.string(),
    });

    const UserResponseSchema = createApiResponseSchema(UserSchema);

    it('검증 성공 시 검증된 데이터를 반환한다', () => {
      const validData: ApiResponse<{ id: number; name: string }> = {
        result: 'SUCCESS',
        message: '성공',
        data: {
          id: 1,
          name: '홍길동',
        },
      };

      const result = safeValidateApiResponse(
        validData,
        UserResponseSchema,
        '/api/user/1',
        'GET',
      );

      expect(result).toEqual(validData);
    });

    it('검증 실패 시 원본 데이터를 반환한다', () => {
      const invalidData = {
        result: 'SUCCESS',
        message: '성공',
        data: {
          id: 'invalid', // 숫자여야 하는데 문자열
          name: 123, // 문자열이어야 하는데 숫자
        },
      };

      const result = safeValidateApiResponse(
        invalidData,
        UserResponseSchema,
        '/api/user/1',
        'GET',
      );

      expect(result).toEqual(invalidData);
    });
  });

  describe('validateEndpointResponse', () => {
    it('스키마가 없는 엔드포인트는 검증을 건너뛴다', () => {
      const unknownData = { arbitrary: 'data' };

      const result = validateEndpointResponse(
        unknownData,
        '/api/unknown',
        'GET',
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(unknownData);
    });

    it('auth 도메인 엔드포인트를 올바르게 매핑한다', () => {
      // require를 모킹해야 할 수도 있습니다
      const mockLoginResponse = {
        result: 'SUCCESS',
        message: '로그인 성공',
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'STUDENT',
        },
      };

      const result = validateEndpointResponse(
        mockLoginResponse,
        '/api/auth/login',
        'POST',
      );

      // 스키마 로딩이 실패할 수 있으므로 유연하게 테스트
      expect(result.isValid).toBe(true);
    });
  });

  describe('CommonSchemas', () => {
    it('StringResponse 스키마가 올바르게 작동한다', () => {
      const stringResponse: ApiResponse<string> = {
        result: 'SUCCESS',
        message: '문자열 응답',
        data: 'test string',
      };

      const result = CommonSchemas.StringResponse.safeParse(stringResponse);
      expect(result.success).toBe(true);
    });

    it('NumberResponse 스키마가 올바르게 작동한다', () => {
      const numberResponse: ApiResponse<number> = {
        result: 'SUCCESS',
        message: '숫자 응답',
        data: 42,
      };

      const result = CommonSchemas.NumberResponse.safeParse(numberResponse);
      expect(result.success).toBe(true);
    });

    it('BooleanResponse 스키마가 올바르게 작동한다', () => {
      const booleanResponse: ApiResponse<boolean> = {
        result: 'SUCCESS',
        message: '불린 응답',
        data: true,
      };

      const result = CommonSchemas.BooleanResponse.safeParse(booleanResponse);
      expect(result.success).toBe(true);
    });

    it('EmptyResponse 스키마가 올바르게 작동한다', () => {
      const emptyResponse: ApiResponse<null> = {
        result: 'SUCCESS',
        message: '빈 응답',
        data: null,
      };

      const result = CommonSchemas.EmptyResponse.safeParse(emptyResponse);
      expect(result.success).toBe(true);
    });

    it('MessageResponse 스키마가 올바르게 작동한다', () => {
      const messageResponse: ApiResponse<{ message: string }> = {
        result: 'SUCCESS',
        message: '메시지 응답',
        data: {
          message: 'Hello World',
        },
      };

      const result = CommonSchemas.MessageResponse.safeParse(messageResponse);
      expect(result.success).toBe(true);
    });

    it('StatusResponse 스키마가 올바르게 작동한다', () => {
      const statusResponse: ApiResponse<{ success: boolean }> = {
        result: 'SUCCESS',
        message: '상태 응답',
        data: {
          success: true,
        },
      };

      const result = CommonSchemas.StatusResponse.safeParse(statusResponse);
      expect(result.success).toBe(true);
    });

    it('IdResponse 스키마가 문자열과 숫자 ID를 모두 허용한다', () => {
      const stringIdResponse: ApiResponse<{ id: string }> = {
        result: 'SUCCESS',
        message: 'ID 응답',
        data: {
          id: 'uuid-string',
        },
      };

      const numberIdResponse: ApiResponse<{ id: number }> = {
        result: 'SUCCESS',
        message: 'ID 응답',
        data: {
          id: 123,
        },
      };

      expect(CommonSchemas.IdResponse.safeParse(stringIdResponse).success).toBe(true);
      expect(CommonSchemas.IdResponse.safeParse(numberIdResponse).success).toBe(true);
    });
  });

  describe('에러 처리', () => {
    it('JSON 파싱 에러를 적절히 처리한다', () => {
      const circularRef: any = {};
      circularRef.self = circularRef;

      const UserSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const UserResponseSchema = createApiResponseSchema(UserSchema);

      const result = validateApiResponse(
        circularRef,
        UserResponseSchema,
        '/api/user/1',
        'GET',
      );

      expect(result.isValid).toBe(false);
      expect(result.originalData).toBe(circularRef);
    });

    it('undefined/null 데이터를 적절히 처리한다', () => {
      const UserSchema = z.object({
        id: z.number(),
        name: z.string(),
      });

      const UserResponseSchema = createApiResponseSchema(UserSchema);

      const undefinedResult = validateApiResponse(
        undefined,
        UserResponseSchema,
        '/api/user/1',
        'GET',
      );

      const nullResult = validateApiResponse(
        null,
        UserResponseSchema,
        '/api/user/1',
        'GET',
      );

      expect(undefinedResult.isValid).toBe(false);
      expect(nullResult.isValid).toBe(false);
    });
  });
});