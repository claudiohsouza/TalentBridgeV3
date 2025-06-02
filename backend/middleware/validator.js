import Joi from 'joi';
import { ValidationError } from './errorHandler.js';

// Middleware de validação genérico
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      console.log('[Validator] Dados recebidos:', JSON.stringify(req.body, null, 2));
      
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: true
      });

      if (error) {
        console.log('[Validator] Erros de validação:', error.details);
        
        const details = error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          type: err.type
        }));
        
        return next(new ValidationError('Erro de validação nos dados enviados', details));
      }

      // Log dos dados validados
      console.log('[Validator] Dados validados:', JSON.stringify(value, null, 2));
      
      req.body = value;
      next();
    } catch (err) {
      console.error('[Validator] Erro inesperado:', err);
      next(new ValidationError('Erro ao processar validação', { general: err.message }));
    }
  };
};

// Mensagens de erro padrão
const errorMessages = {
  string: {
    email: 'Deve ser um email válido',
    min: 'Deve ter pelo menos {#limit} caracteres',
    max: 'Deve ter no máximo {#limit} caracteres',
    empty: 'Este campo é obrigatório'
  },
  any: {
    required: 'Este campo é obrigatório'
  },
  number: {
    integer: 'O valor deve ser um número inteiro'
  }
};

// Validação de Login
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': errorMessages.string.email,
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': errorMessages.string.min,
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  })
});

// Validação de Registro
export const registroSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'string.empty': 'Email é obrigatório',
    'any.required': 'Email é obrigatório'
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'string.empty': 'Senha é obrigatória',
    'any.required': 'Senha é obrigatória'
  }),
  nome: Joi.string().required().messages({
    'string.empty': 'Nome é obrigatório',
    'any.required': 'Nome é obrigatório'
  }),
  papel: Joi.string().valid('instituicao_ensino', 'chefe_empresa', 'instituicao_contratante').required().messages({
    'any.only': 'Papel deve ser instituicao_ensino, chefe_empresa ou instituicao_contratante',
    'string.empty': 'Papel é obrigatório',
    'any.required': 'Papel é obrigatório'
  }),
  localizacao: Joi.string().required().messages({
    'string.empty': 'Localização é obrigatória',
    'any.required': 'Localização é obrigatória'
  }),
  dadosPerfil: Joi.object({
    // Campos para instituição de ensino
    tipo: Joi.string().when('..papel', {
      is: 'instituicao_ensino',
      then: Joi.required().messages({
        'string.empty': 'Tipo da instituição é obrigatório',
        'any.required': 'Tipo da instituição é obrigatório'
      }),
      otherwise: Joi.optional()
    }),
    areas_ensino: Joi.array().items(Joi.string()).min(1).when('..papel', {
      is: 'instituicao_ensino',
      then: Joi.required().messages({
        'array.min': 'Selecione pelo menos uma área de ensino',
        'any.required': 'Áreas de ensino são obrigatórias'
      }),
      otherwise: Joi.optional()
    }),
    qtd_alunos: Joi.number().integer().min(1).when('..papel', {
      is: 'instituicao_ensino',
      then: Joi.required().messages({
        'number.base': 'Quantidade de alunos deve ser um número',
        'number.min': 'Quantidade de alunos deve ser maior que zero',
        'any.required': 'Quantidade de alunos é obrigatória'
      }),
      otherwise: Joi.optional()
    }),
    // Campos para chefe de empresa
    empresa: Joi.string().when('..papel', {
      is: 'chefe_empresa',
      then: Joi.required().messages({
        'string.empty': 'Nome da empresa é obrigatório',
        'any.required': 'Nome da empresa é obrigatório'
      }),
      otherwise: Joi.optional()
    }),
    setor: Joi.string().when('..papel', {
      is: 'chefe_empresa',
      then: Joi.required().messages({
        'string.empty': 'Setor da empresa é obrigatório',
        'any.required': 'Setor da empresa é obrigatório'
      }),
      otherwise: Joi.optional()
    }),
    porte: Joi.string().when('..papel', {
      is: 'chefe_empresa',
      then: Joi.required().messages({
        'string.empty': 'Porte da empresa é obrigatório',
        'any.required': 'Porte da empresa é obrigatório'
      }),
      otherwise: Joi.optional()
    }),
    cargo: Joi.string().when('..papel', {
      is: 'chefe_empresa',
      then: Joi.required().messages({
        'string.empty': 'Cargo é obrigatório',
        'any.required': 'Cargo é obrigatório'
      }),
      otherwise: Joi.optional()
    }),
    areas_atuacao: Joi.array().items(Joi.string()).min(1).when('..papel', {
      is: 'chefe_empresa',
      then: Joi.required().messages({
        'array.min': 'Selecione pelo menos uma área de atuação',
        'any.required': 'Áreas de atuação são obrigatórias'
      }),
      otherwise: Joi.optional()
    }),
    // Campos para instituição contratante
    areas_interesse: Joi.array().items(Joi.string()).min(1).max(4).when('..papel', {
      is: 'instituicao_contratante',
      then: Joi.required().messages({
        'array.min': 'Selecione pelo menos uma área de interesse',
        'array.max': 'Máximo de 4 áreas de interesse permitido',
        'any.required': 'Áreas de interesse são obrigatórias'
      }),
      otherwise: Joi.optional()
    }),
    programas_sociais: Joi.array().items(Joi.string()).min(1).when('..papel', {
      is: 'instituicao_contratante',
      then: Joi.required().messages({
        'array.min': 'Selecione pelo menos um programa social',
        'any.required': 'Programas sociais são obrigatórios'
      }),
      otherwise: Joi.optional()
    })
  }).required().messages({
    'object.base': 'Dados do perfil são obrigatórios',
    'any.required': 'Dados do perfil são obrigatórios'
  })
});

// Validação de Atualização de Usuário
export const atualizacaoUsuarioSchema = Joi.object({
  email: Joi.string().email().optional().messages({
    'string.email': errorMessages.string.email
  }),
  nome: Joi.string().optional(),
  localizacao: Joi.string().optional(),
  tipo: Joi.string().optional(),
  qtd_alunos: Joi.number().integer().min(1).optional(),
  areas_ensino: Joi.array().items(Joi.string()).optional(),
  senhaAtual: Joi.string().min(6).optional().messages({
    'string.min': errorMessages.string.min
  }),
  novaSenha: Joi.string().min(6).optional().messages({
    'string.min': errorMessages.string.min
  })
}).custom((value, helpers) => {
  if (value.novaSenha && !value.senhaAtual) {
    return helpers.error('any.invalid', { message: 'Senha atual é necessária para alterar a senha' });
  }
  return value;
});

// Validação de Jovem
export const jovemSchema = Joi.object({
  nome: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  email: Joi.string().email().required().messages({
    'string.email': errorMessages.string.email,
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  telefone: Joi.string(),
  idade: Joi.number().integer().min(14).max(100),
  formacao: Joi.string(),
  curso: Joi.string(),
  habilidades: Joi.array().items(Joi.string()),
  interesses: Joi.array().items(Joi.string()),
  planos_futuros: Joi.string()
});

// Validação de Oportunidade
export const oportunidadeSchema = Joi.object({
  titulo: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  descricao: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  tipo: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  area: Joi.string().required().messages({
    'string.empty': errorMessages.string.empty,
    'any.required': errorMessages.any.required
  }),
  requisitos: Joi.array().items(Joi.string()).allow(null).optional(),
  beneficios: Joi.array().items(Joi.string()).allow(null).optional(),
  data_inicio: Joi.date().iso().allow(null).optional(),
  data_fim: Joi.date().iso().min(Joi.ref('data_inicio')).allow(null).optional().messages({
    'date.min': 'Data fim deve ser posterior à data início'
  })
});

// Validação de Recomendação
export const recomendacaoSchema = Joi.object({
  jovem_id: Joi.number().integer().required().messages({
    'number.base': 'ID do jovem deve ser um número',
    'number.integer': errorMessages.number.integer,
    'any.required': errorMessages.any.required
  }),
  oportunidade_id: Joi.number().integer().required().messages({
    'number.base': 'ID da oportunidade deve ser um número',
    'number.integer': errorMessages.number.integer,
    'any.required': errorMessages.any.required
  }),
  justificativa: Joi.string().min(10).max(1000).required().messages({
    'string.empty': errorMessages.string.empty,
    'string.min': 'Justificativa deve ter pelo menos 10 caracteres',
    'string.max': 'Justificativa deve ter no máximo 1000 caracteres',
    'any.required': errorMessages.any.required
  })
});

export default {
  validate,
  loginSchema,
  registroSchema,
  atualizacaoUsuarioSchema,
  jovemSchema,
  oportunidadeSchema,
  recomendacaoSchema
}; 