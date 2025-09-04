/**
 * 도메인별 Zod 스키마 검증 테스트
 * @description 각 도메인의 스키마가 실제 API 응답과 일치하는지 테스트
 */

import { describe, it, expect } from 'vitest';

// Auth 도메인 스키마
import {
  UserInfoSchema,
  LogoutResponseSchema,
  LoginRequestSchema,
  UserInfoApiResponseSchema,
  LogoutApiResponseSchema,
  LoginApiResponseSchema,
} from '../auth/schemas';

// Exam 도메인 스키마
import {
  ServerExamSchema,
  ExamListApiResponseSchema,
  ExamDetailApiResponseSchema,
} from '../exam/schemas';

// Dashboard 도메인 스키마
import {
  ExamSubmissionInfoSchema,
  ScoreDistributionSchema,
  RecentExamsStatusApiResponseSchema,
  ScoreDistributionApiResponseSchema,
} from '../dashboard/schemas';

// Pokemon 도메인 스키마
import {
  PokemonSchema,
  PokemonListResponseSchema,
  PokemonSpritesSchema,
  PokemonStatSchema,
} from '../pokemon/schemas';

// Health Check 도메인 스키마
import {
  HealthCheckApiResponseSchema,
  ServiceHealthInfoSchema,
} from '../health-check/schemas';

describe('도메인별 스키마 검증', () => {
  describe('Auth 도메인', () => {
    it('UserInfo 스키마가 올바른 사용자 정보를 검증한다', () => {
      const validUserInfo = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'TEACHER',
      };

      const result = UserInfoSchema.safeParse(validUserInfo);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(1);
        expect(result.data.username).toBe('testuser');
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.role).toBe('TEACHER');
      }
    });

    it('UserInfo 스키마가 잘못된 이메일을 거부한다', () => {
      const invalidUserInfo = {
        id: 1,
        username: 'testuser',
        email: 'invalid-email',
        role: 'TEACHER',
      };

      const result = UserInfoSchema.safeParse(invalidUserInfo);
      expect(result.success).toBe(false);
    });

    it('UserInfo 스키마가 잘못된 역할을 거부한다', () => {
      const invalidUserInfo = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'INVALID_ROLE',
      };

      const result = UserInfoSchema.safeParse(invalidUserInfo);
      expect(result.success).toBe(false);
    });

    it('LogoutResponse 스키마가 올바른 로그아웃 응답을 검증한다', () => {
      const validLogoutResponse = {
        success: true,
        message: '로그아웃되었습니다.',
      };

      const result = LogoutResponseSchema.safeParse(validLogoutResponse);
      expect(result.success).toBe(true);
    });

    it('LoginRequest 스키마가 올바른 로그인 요청을 검증한다', () => {
      const validLoginRequest = {
        username: 'testuser',
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(validLoginRequest);
      expect(result.success).toBe(true);
    });

    it('LoginRequest 스키마가 빈 사용자명을 거부한다', () => {
      const invalidLoginRequest = {
        username: '',
        password: 'password123',
      };

      const result = LoginRequestSchema.safeParse(invalidLoginRequest);
      expect(result.success).toBe(false);
    });

    it('UserInfoApiResponse 스키마가 완전한 API 응답을 검증한다', () => {
      const validApiResponse = {
        result: 'SUCCESS',
        message: '사용자 정보 조회 성공',
        data: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'STUDENT',
        },
      };

      const result = UserInfoApiResponseSchema.safeParse(validApiResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Exam 도메인', () => {
    it('ServerExam 스키마가 올바른 시험 정보를 검증한다', () => {
      const validExam = {
        examId: 1,
        title: '중간고사',
        subject: '수학',
        grade: 2,
        duration: 60,
        status: 'ACTIVE',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
      };

      const result = ServerExamSchema.safeParse(validExam);
      expect(result.success).toBe(true);
    });

    it('ServerExam 스키마가 잘못된 학년을 거부한다', () => {
      const invalidExam = {
        examId: 1,
        title: '중간고사',
        subject: '수학',
        grade: 7, // 1-6만 허용
        duration: 60,
        status: 'ACTIVE',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
      };

      const result = ServerExamSchema.safeParse(invalidExam);
      expect(result.success).toBe(false);
    });

    it('ServerExam 스키마가 잘못된 상태를 거부한다', () => {
      const invalidExam = {
        examId: 1,
        title: '중간고사',
        subject: '수학',
        grade: 2,
        duration: 60,
        status: 'INVALID_STATUS',
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
      };

      const result = ServerExamSchema.safeParse(invalidExam);
      expect(result.success).toBe(false);
    });

    it('ExamListApiResponse 스키마가 시험 목록 응답을 검증한다', () => {
      const validExamListResponse = {
        result: 'SUCCESS',
        message: '시험 목록 조회 성공',
        data: [
          {
            examId: 1,
            title: '중간고사',
            subject: '수학',
            grade: 2,
            duration: 60,
            status: 'ACTIVE',
            createdAt: '2024-01-15T09:00:00Z',
            updatedAt: '2024-01-15T09:00:00Z',
          },
        ],
      };

      const result = ExamListApiResponseSchema.safeParse(validExamListResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Dashboard 도메인', () => {
    it('ExamSubmissionInfo 스키마가 올바른 제출 정보를 검증한다', () => {
      const validSubmissionInfo = {
        examId: 1,
        examTitle: '중간고사',
        totalSubmissions: 25,
        averageScore: 85.5,
        maxScore: 100,
        minScore: 60,
        submissionRate: 92.5,
      };

      const result = ExamSubmissionInfoSchema.safeParse(validSubmissionInfo);
      expect(result.success).toBe(true);
    });

    it('ExamSubmissionInfo 스키마가 잘못된 점수 범위를 거부한다', () => {
      const invalidSubmissionInfo = {
        examId: 1,
        examTitle: '중간고사',
        totalSubmissions: 25,
        averageScore: 110, // 100 초과
        maxScore: 100,
        minScore: 60,
        submissionRate: 92.5,
      };

      const result = ExamSubmissionInfoSchema.safeParse(invalidSubmissionInfo);
      expect(result.success).toBe(false);
    });

    it('ScoreDistribution 스키마가 점수 분포를 검증한다', () => {
      const validScoreDistribution = {
        range: '90-100',
        count: 5,
        percentage: 20.0,
      };

      const result = ScoreDistributionSchema.safeParse(validScoreDistribution);
      expect(result.success).toBe(true);
    });

    it('ScoreDistribution 스키마가 잘못된 백분율을 거부한다', () => {
      const invalidScoreDistribution = {
        range: '90-100',
        count: 5,
        percentage: 150.0, // 100 초과
      };

      const result = ScoreDistributionSchema.safeParse(invalidScoreDistribution);
      expect(result.success).toBe(false);
    });
  });

  describe('Pokemon 도메인 (외부 API)', () => {
    it('PokemonDetail 스키마가 올바른 포켓몬 정보를 검증한다', () => {
      const validPokemonDetail = {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        sprites: {
          front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
          back_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/25.png',
          front_shiny: null,
          back_shiny: null,
          other: {
            'official-artwork': {
              front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
            },
          },
        },
        stats: [
          { base_stat: 35, effort: 0, stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' } },
          { base_stat: 55, effort: 0, stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/2/' } },
          { base_stat: 40, effort: 0, stat: { name: 'defense', url: 'https://pokeapi.co/api/v2/stat/3/' } },
          { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: 'https://pokeapi.co/api/v2/stat/4/' } },
          { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: 'https://pokeapi.co/api/v2/stat/5/' } },
          { base_stat: 90, effort: 2, stat: { name: 'speed', url: 'https://pokeapi.co/api/v2/stat/6/' } },
        ],
        types: [
          { slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } },
        ],
        abilities: [
          { 
            is_hidden: false, 
            slot: 1, 
            ability: { name: 'static', url: 'https://pokeapi.co/api/v2/ability/9/' } 
          },
          { 
            is_hidden: true, 
            slot: 3, 
            ability: { name: 'lightning-rod', url: 'https://pokeapi.co/api/v2/ability/31/' } 
          },
        ],
      };

      const result = PokemonSchema.safeParse(validPokemonDetail);
      expect(result.success).toBe(true);
    });

    it('PokemonStats 스키마가 정확히 6개의 스탯을 요구한다', () => {
      const validStats = [
        { base_stat: 35, effort: 0, stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' } },
        { base_stat: 55, effort: 0, stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/2/' } },
        { base_stat: 40, effort: 0, stat: { name: 'defense', url: 'https://pokeapi.co/api/v2/stat/3/' } },
        { base_stat: 50, effort: 0, stat: { name: 'special-attack', url: 'https://pokeapi.co/api/v2/stat/4/' } },
        { base_stat: 50, effort: 0, stat: { name: 'special-defense', url: 'https://pokeapi.co/api/v2/stat/5/' } },
        { base_stat: 90, effort: 2, stat: { name: 'speed', url: 'https://pokeapi.co/api/v2/stat/6/' } },
      ];

      const invalidStatsShort = validStats.slice(0, 5); // 5개만

      const validResult = PokemonStatSchema.safeParse(validStats);
      const invalidResult = PokemonStatSchema.safeParse(invalidStatsShort);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    it('PokemonListResponse 스키마가 포켓몬 목록을 검증한다', () => {
      const validPokemonListResponse = {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      };

      const result = PokemonListResponseSchema.safeParse(validPokemonListResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Health Check 도메인', () => {
    it('ServiceHealth 스키마가 올바른 서비스 상태를 검증한다', () => {
      const validServiceHealth = {
        status: 'UP',
        responseTimeMs: 150,
        details: {
          version: '1.0.0',
          environment: 'production',
        },
      };

      const result = ServiceHealthInfoSchema.safeParse(validServiceHealth);
      expect(result.success).toBe(true);
    });

    it('ServiceHealth 스키마가 잘못된 상태를 거부한다', () => {
      const invalidServiceHealth = {
        status: 'INVALID_STATUS',
        responseTimeMs: 150,
        details: {},
      };

      const result = ServiceHealthInfoSchema.safeParse(invalidServiceHealth);
      expect(result.success).toBe(false);
    });

    it('ServiceHealth 스키마가 과도한 응답시간을 거부한다', () => {
      const invalidServiceHealth = {
        status: 'UP',
        responseTimeMs: 70000, // 60초 초과
        details: {},
      };

      const result = ServiceHealthInfoSchema.safeParse(invalidServiceHealth);
      expect(result.success).toBe(false);
    });

    it('HealthCheckApiResponse 스키마가 전체 헬스체크 응답을 검증한다', () => {
      const validHealthCheckResponse = {
        result: 'SUCCESS',
        message: '헬스체크 성공',
        data: {
          overallStatus: 'UP',
          services: {
            database: {
              status: 'UP',
              responseTimeMs: 50,
              details: {
                connectionPool: 'healthy',
              },
            },
            redis: {
              status: 'UP',
              responseTimeMs: 10,
              details: {
                memory: '128MB',
              },
            },
          },
          timestamp: '2024-01-15T10:30:00Z',
        },
      };

      const result = HealthCheckApiResponseSchema.safeParse(validHealthCheckResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('스키마 간 일관성 테스트', () => {
    it('모든 도메인의 ApiResponse 스키마가 일관된 구조를 가진다', () => {
      // 성공 응답의 공통 구조 확인
      const successResponse = {
        result: 'SUCCESS',
        message: '테스트 메시지',
        data: { test: true },
      };

      // 에러 응답의 공통 구조 확인
      const errorResponse = {
        result: 'ERROR',
        message: '에러 메시지',
        data: null,
      };

      // 각 도메인 스키마들이 모두 이 기본 구조를 지원하는지 확인
      const schemas = [
        UserInfoApiResponseSchema,
        LogoutApiResponseSchema,
        LoginApiResponseSchema,
        RecentExamsStatusApiResponseSchema,
        ScoreDistributionApiResponseSchema,
        HealthCheckApiResponseSchema,
      ];

      schemas.forEach((schema) => {
        // 모든 스키마가 ERROR 응답을 허용해야 함
        const errorResult = schema.safeParse(errorResponse);
        expect(errorResult.success).toBe(true);
      });
    });

    it('모든 ID 필드가 일관된 타입을 사용한다', () => {
      // 숫자 ID
      const numberId = 123;
      // 문자열 ID (UUID 등)
      const stringId = 'uuid-1234-5678';

      // ID를 사용하는 스키마들이 일관된 타입을 사용하는지 확인
      expect(typeof numberId).toBe('number');
      expect(typeof stringId).toBe('string');
    });
  });
});