/**
 * Sugestões de vídeo do canal @laerciorefundini por exercício.
 * Geradas em 2026-09-25 cruzando os títulos dos 2008 vídeos do canal com o catálogo.
 * `confidence`: "alta" = vídeo específico do exercício; "media" = vídeo próximo (variação
 * ou treino do grupo). Exercícios sem vídeo específico ficam fora desta lista.
 * A tela /admin/videos permite confirmar, trocar ou remover cada link.
 */
export interface VideoSuggestion {
  videoId: string;
  title: string;
  confidence: "alta" | "media";
}

export const VIDEO_SUGGESTIONS: Record<string, VideoSuggestion> = {
  "supino-inclinado-halter": { videoId: "Ky_JXqloq0w", title: "Como Fazer o SUPINO INCLINADO COM HALTERES do Jeito Certo!", confidence: "alta" },
  "supino-reto-halter": { videoId: "7f3y45hClCc", title: "6 Erros no DUMBBELL PRESS que Impedem Seu Peitoral de Crescer", confidence: "alta" },
  "supino-maquina": { videoId: "a56lnqizt-A", title: "5 ERROS que você precisa PARAR DE FAZER NO SUPINO MÁQUINA", confidence: "alta" },
  "cross-over": { videoId: "tkT1yowN8oI", title: "Como Fazer o CROSS OVER | 5 Erros FATAIS Que Não Deixam Seu Peito Crescer!", confidence: "alta" },
  "peck-deck": { videoId: "vpHr5eIvEUE", title: "Como Fazer PECK DECK Corretamente Para MAXIMIZAR o Ganho De Peitoral", confidence: "alta" },
  "puxada-frente": { videoId: "QTQABcLosXk", title: "5 Erros Que Todo Mundo Faz no PULLDOWN (Cresça Sua Dorsal)", confidence: "alta" },
  "puxada-pegada-fechada": { videoId: "QTQABcLosXk", title: "5 Erros Que Todo Mundo Faz no PULLDOWN (Cresça Sua Dorsal)", confidence: "media" },
  "remada-unilateral": { videoId: "zBPVq78VHV8", title: "Remada Unilateral: VOCÊ FAZ ESSE EXERCÍCIO ERRADO!", confidence: "alta" },
  "remada-curvada-halter": { videoId: "HpvaOR4H5Hg", title: "NUNCA MAIS ERRE A REMADA CURVADA!", confidence: "alta" },
  "remada-baixa": { videoId: "mUgFn3aMAP4", title: "Como Fazer a REMADA BAIXA (Passo a Passo)", confidence: "alta" },
  "remada-maquina": { videoId: "OxemwyX7zPQ", title: "Os 4 ERROS na REMADA MÁQUINA + 1 Dica de Mestre Para CRESCER DORSAL", confidence: "alta" },
  "pull-over-halter": { videoId: "q_Qs9fdwscs", title: "Como Fazer Pullover (Tudo Que Você Precisa Saber)", confidence: "alta" },
  "levantamento-terra-halter": { videoId: "uNrYJc7lD_A", title: "Pare de Fazer LEVANTAMENTO TERRA Assim! 7 Erros que Você Comete", confidence: "alta" },
  "remada-halter-banco": { videoId: "DDfGOYazBAA", title: "Como Fazer a REMADA SERROTE Com Halteres (GUIA COMPLETO)", confidence: "alta" },
  "desenvolvimento-halter": { videoId: "rH-ns_GJM3U", title: "Maximize Os Ganhos de OMBRO Com o Desenvolvimento Com Halteres", confidence: "alta" },
  "elevacao-lateral": { videoId: "c7zMmbWkUPw", title: "Como Fazer ELEVAÇÃO LATERAL! O Melhor Exercício Para OMBRO", confidence: "alta" },
  "elevacao-frontal-halter": { videoId: "kKjjeiXL960", title: "Como Fazer ELEVAÇÃO FRONTAL Com Halteres (GUIA COMPLETO)", confidence: "alta" },
  "crucifixo-invertido-halter": { videoId: "G3DXKpk5AJA", title: "Como Fazer o CRUCIFIXO INVERTIDO Para Crescer o Posterior Do Ombro", confidence: "alta" },
  "arnold-press": { videoId: "IIdj90AJArU", title: "Como fazer O DESENVOLVIMENTO ARNOLD! \"O MELHOR EXERCÍCIO PARA OMBRO\"", confidence: "alta" },
  "remada-alta-halter": { videoId: "BIs9i-qNGU0", title: "REMADA ALTA. FAZER OU NÃO FAZER?", confidence: "media" },
  "elevacao-lateral-cabo": { videoId: "wGsKrK0bhps", title: "Como Ter OMBROS LARGOS Com a ELEVAÇÃO LATERAL NO CABO!", confidence: "alta" },
  "desenvolvimento-maquina": { videoId: "66ApmhLk6-k", title: "COMO FAZER O DESENVOLVIMENTO COM BARRA | DESENVOLVIMENTO OMBRO", confidence: "media" },
  "rosca-alternada": { videoId: "PsHVWZPA4eY", title: "QUAL A DIFERENÇA: ROSCA SIMULTÂNEA OU ALTERNADA?", confidence: "alta" },
  "rosca-martelo": { videoId: "6GClLap3WCA", title: "Como Fazer ROSCA MARTELO Perfeita | Guia Para Iniciantes", confidence: "alta" },
  "rosca-scott-halter": { videoId: "Drr7NpnjssA", title: "Como Fazer ROSCA SCOTT | 5 Erros Na Rosca Scott Que Impedem Seu Bíceps de Crescer!", confidence: "alta" },
  "rosca-concentrada": { videoId: "c8-I4M1t5To", title: "O Exercício SECRETO do ARNOLD para BÍCEPS : ROSCA CONCENTRADA", confidence: "alta" },
  "rosca-cabo": { videoId: "S0FvPUzOceY", title: "ROSCA DIRETA NA POLIA BAIXA | Aprenda o Exercício do CBUM", confidence: "alta" },
  "rosca-direta-halter": { videoId: "k-2kpJKKSGQ", title: "Pare de Fazer Rosca Direta Com Halteres Desse Jeito!", confidence: "alta" },
  "triceps-pulley": { videoId: "btj6dDfAQ2w", title: "4 DICAS Para Construir Tríceps ENORMES com o TRÍCEPS CORDA", confidence: "alta" },
  "triceps-frances-halter": { videoId: "xi2B_NRbqQo", title: "Nunca Mais Erre Isso no TRÍCEPS FRANCÊS", confidence: "alta" },
  "triceps-coice-halter": { videoId: "9fDLbeoMyK0", title: "ERROS E DICAS NO TRÍCEPS COICE. APRENDA COMO EXECUTAR CORRETAMENTE", confidence: "alta" },
  "triceps-testa-halter": { videoId: "mvGvq25L2EM", title: "5 Erros no TRÍCEPS TESTA Que Podem Te MACHUCAR!", confidence: "alta" },
  "triceps-banco": { videoId: "UGxwkr52YLM", title: "COMO FAZER O TRÍCEPS BANCO - ERROS + INTENSIDADE", confidence: "alta" },
  "agachamento-halter": { videoId: "vPCsDfkMa3o", title: "3 Passos Para Fazer o Agachamento Livre PERFEITO (O Guia Mais Completo)", confidence: "alta" },
  "leg-press-45": { videoId: "adPY6cd4h58", title: "Como Fazer o LEG PRESS 45º | Tudo Que Você Precisa Saber", confidence: "alta" },
  "hack-machine": { videoId: "hzvwXKUDWIc", title: "Como Fazer o AGACHAMENTO HACK", confidence: "alta" },
  "cadeira-extensora": { videoId: "I_uBK4DDflU", title: "Como fazer CADEIRA EXTENSORA Para Ativar ao MÁXIMO Sua Coxa", confidence: "alta" },
  "afundo-halter": { videoId: "r04UVVW4X2k", title: "COMO FAZER AFUNDO PARA ACABAR COM A COXA FINA", confidence: "alta" },
  "agachamento-bulgaro-halter": { videoId: "hY1mAqbXhvQ", title: "Esse Exercício Não Pode Faltar no Seu Treino de Perna | Agachamento Bulgaro", confidence: "alta" },
  "agachamento-sumô-halter": { videoId: "hOhbaafYnr0", title: "Como Fazer o AGACHAMENTO SUMÔ (TUDO QUE VOCÊ PRECISA SABER)", confidence: "alta" },
  "passada-halter": { videoId: "s9p1uOmDv-M", title: "Diferenças entre Avanço e Afundo - PERNAS", confidence: "media" },
  "stiff-halter": { videoId: "_6ElJLyBXcE", title: "COMO FAZER STIFF | 6 Erros No STIFF Que Jogam Seu Treino No Lixo", confidence: "alta" },
  "mesa-flexora": { videoId: "KIoiwCfcTXM", title: "Como Fazer MESA FLEXORA Como Um Profissional!", confidence: "alta" },
  "cadeira-flexora": { videoId: "RYCqCZhHh74", title: "Como Fazer a CADEIRA FLEXORA (Como MAXIMIZAR e Ter MAIS RESULTADO)", confidence: "alta" },
  "levantamento-romeno-halter": { videoId: "CcZRgMzzIO0", title: "Aprenda TUDO sobre o STIFF e como INTENSIFICAR o exercício", confidence: "media" },
  "hip-thrust-halter": { videoId: "DfoqpAwabWY", title: "Os 2 ÚNICOS Exercícios para Glúteos Fortes e Redondos", confidence: "media" },
  "elevacao-pelvica": { videoId: "DfoqpAwabWY", title: "Os 2 ÚNICOS Exercícios para Glúteos Fortes e Redondos", confidence: "media" },
  "abducao-maquina": { videoId: "SNu9SM_j3b4", title: "APRENDA A DIFERENÇA ENTRE CADEIRA ADUTORA e CADEIRA ABDUTORA", confidence: "alta" },
  "agachamento-bulgaro-gluteo": { videoId: "hY1mAqbXhvQ", title: "Esse Exercício Não Pode Faltar no Seu Treino de Perna | Agachamento Bulgaro", confidence: "alta" },
  "panturrilha-em-pe-halter": { videoId: "ptRbM_oDLfY", title: "Force suas Panturrilhas a CRESCEREM trocando a POSIÇÃO DOS PÉS", confidence: "alta" },
  "panturrilha-sentado": { videoId: "N_bpzfkp0mg", title: "5 ERROS Comuns Ao Fazer PANTURRILHA SENTADO NA MÁQUINA", confidence: "alta" },
  "panturrilha-leg-press": { videoId: "xIq9K_oeTK4", title: "Treino de PANTURRILHA Completo (Baseado Na Ciência)", confidence: "media" },
  "panturrilha-unilateral": { videoId: "xIq9K_oeTK4", title: "Treino de PANTURRILHA Completo (Baseado Na Ciência)", confidence: "media" },
  prancha: { videoId: "Wk5paY5G_Qg", title: "Como Fazer a PRANCHA ABDOMINAL Para Definir o ABDOMEN (EM CASA)", confidence: "alta" },
  "abdominal-supra": { videoId: "_Zeku5F7IX8", title: "Como Fazer Abdominal EM CASA Para Definir o Abdômen! (GUIA MAIS DETALHADO)", confidence: "alta" },
  "abdominal-infra": { videoId: "_Zeku5F7IX8", title: "Como Fazer Abdominal EM CASA Para Definir o Abdômen! (GUIA MAIS DETALHADO)", confidence: "media" },
  "abdominal-cabo": { videoId: "G8EjhDhBLSA", title: "APRENDA ABDOMINAL AVANÇADO", confidence: "media" },
  "elevacao-pernas-barra": { videoId: "G8EjhDhBLSA", title: "APRENDA ABDOMINAL AVANÇADO", confidence: "media" },
  "rosca-punho-halter": { videoId: "KBSPoICoA_Q", title: "4 EXERCÍCIOS OBRIGATÓRIOS PARA SEU TREINO DE ANTEBRAÇO", confidence: "media" },
  "rosca-punho-inversa": { videoId: "KBSPoICoA_Q", title: "4 EXERCÍCIOS OBRIGATÓRIOS PARA SEU TREINO DE ANTEBRAÇO", confidence: "media" },
  "rosca-inversa-halter": { videoId: "RqeLliN-2Zo", title: "Treino de Antebraço: O Treino DEFINITIVO Para Crescer o Antebraço RÁPIDO", confidence: "media" },
  "farmer-walk": { videoId: "BKVc8IyB3Dg", title: "Treino de ANTEBRAÇO Completo (Baseado Em Ciência)", confidence: "media" },
  "encolhimento-halter": { videoId: "_vKcoDlMJQk", title: "Treino de TRAPÉZIO COMPLETO (Baseado em Ciência)", confidence: "media" },
  "encolhimento-barra-trapezio": { videoId: "ctfW9AzuFH0", title: "TOP 3 MELHORES EXERCÍCIOS PRA TREINO DE TRAPÉZIO", confidence: "media" },
  "remada-alta-trapezio": { videoId: "BIs9i-qNGU0", title: "REMADA ALTA. FAZER OU NÃO FAZER?", confidence: "media" },
  "encolhimento-cabo": { videoId: "ahRe2S9HDdM", title: "5 Melhores Exercícios Para Ter TRAPÉZIOS GRANDES", confidence: "media" },
};

export const youtubeWatchUrl = (videoId: string): string =>
  `https://www.youtube.com/watch?v=${videoId}`;
