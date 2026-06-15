export const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const FETCH_TIMEOUT_MS = 15000;

export const CATEGORY_KEYS = [
  'corrida_feminino',
  'corrida_masculino',
  'caminhada_feminino',
  'caminhada_masculino',
];

export const CATEGORY_LABELS = {
  caminhada_feminino: 'Caminhada Feminino',
  caminhada_masculino: 'Caminhada Masculino',
  corrida_feminino: 'Corrida Feminino',
  corrida_masculino: 'Corrida Masculino',
};

export const CATEGORY_SHORT_LABELS = {
  caminhada_feminino: 'Cam. Fem.',
  caminhada_masculino: 'Cam. Masc.',
  corrida_feminino: 'Cor. Fem.',
  corrida_masculino: 'Cor. Masc.',
};

export const CATEGORY_PATTERN =
  /RESULTADO\s+(CAMINHADA|CORRIDA)\s+(FEMININO|MASCULINO)/i;

export const CATEGORY_MAP = {
  'CAMINHADA FEMININO': 'caminhada_feminino',
  'CAMINHADA MASCULINO': 'caminhada_masculino',
  'CORRIDA FEMININO': 'corrida_feminino',
  'CORRIDA MASCULINO': 'corrida_masculino',
};

export const REQUIRED_COLUMNS = ['coloc', 'num', 'nome', 'equipe', 'fx.et', 'ritmo', 'liquido'];
