-- Exemplos de opções para popular o banco de dados
-- Reutilizando os exemplos do opcoes.js

-- 1. OPÇÕES DO SISTEMA
-- Áreas de Ensino
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('area_ensino', 'tecnologia_informacao', 1),
('area_ensino', 'engenharia_software', 2),
('area_ensino', 'ciencia_computacao', 3),
('area_ensino', 'analise_dados', 4),
('area_ensino', 'engenharia_mecanica', 5),
('area_ensino', 'engenharia_eletrica', 6),
('area_ensino', 'engenharia_civil', 7),
('area_ensino', 'administracao', 8),
('area_ensino', 'marketing_digital', 9),
('area_ensino', 'design_grafico', 10),
('area_ensino', 'medicina', 11),
('area_ensino', 'enfermagem', 12),
('area_ensino', 'psicologia', 13),
('area_ensino', 'direito', 14),
('area_ensino', 'contabilidade', 15);

-- Áreas de Interesse
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('areas_interesse', 'tecnologia', 1),
('areas_interesse', 'educacao', 2),
('areas_interesse', 'administracao', 3),
('areas_interesse', 'engenharia', 4),
('areas_interesse', 'saude', 5),
('areas_interesse', 'marketing', 6),
('areas_interesse', 'financas', 7),
('areas_interesse', 'design', 8),
('areas_interesse', 'comunicacao', 9),
('areas_interesse', 'sustentabilidade', 10);

-- Programas Sociais
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('programas_sociais', 'jovem_aprendiz', 1),
('programas_sociais', 'estagio', 2),
('programas_sociais', 'trainee', 3),
('programas_sociais', 'primeiro_emprego', 4),
('programas_sociais', 'inclusao_social', 5),
('programas_sociais', 'diversidade', 6),
('programas_sociais', 'capacitacao_profissional', 7);

-- Tipos de Instituição Contratante
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('tipos_instituicao', 'ong', 1),
('tipos_instituicao', 'empresa', 2),
('tipos_instituicao', 'governo', 3);

-- Tipos de Instituição de Ensino
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('tipos_instituicao_ensino', 'escola', 1),
('tipos_instituicao_ensino', 'faculdade', 2),
('tipos_instituicao_ensino', 'universidade', 3),
('tipos_instituicao_ensino', 'curso_tecnico', 4);

-- Setores de Empresas
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('setores_empresa', 'tecnologia', 1),
('setores_empresa', 'manufatura', 2),
('setores_empresa', 'servicos', 3),
('setores_empresa', 'comercio', 4),
('setores_empresa', 'educacao', 5),
('setores_empresa', 'saude', 6),
('setores_empresa', 'outro', 7);

-- Portes de Empresas
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('portes_empresa', 'micro', 1),
('portes_empresa', 'pequena', 2),
('portes_empresa', 'media', 3),
('portes_empresa', 'grande', 4);

-- Tipos de Vaga
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('tipos_vaga', 'estagio', 1),
('tipos_vaga', 'clt', 2),
('tipos_vaga', 'pj', 3),
('tipos_vaga', 'temporario', 4),
('tipos_vaga', 'freelancer', 5),
('tipos_vaga', 'jovem_aprendiz', 6),
('tipos_vaga', 'trainee', 7);

-- Áreas de Atuação
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('areas_atuacao', 'tecnologia_informacao', 1),
('areas_atuacao', 'desenvolvimento_software', 2),
('areas_atuacao', 'marketing_digital', 3),
('areas_atuacao', 'recursos_humanos', 4),
('areas_atuacao', 'administracao', 5),
('areas_atuacao', 'financas', 6),
('areas_atuacao', 'contabilidade', 7),
('areas_atuacao', 'design', 8),
('areas_atuacao', 'vendas', 9),
('areas_atuacao', 'atendimento_cliente', 10),
('areas_atuacao', 'engenharia', 11),
('areas_atuacao', 'producao', 12),
('areas_atuacao', 'logistica', 13),
('areas_atuacao', 'saude', 14),
('areas_atuacao', 'educacao', 15);

-- Habilidades Profissionais
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('habilidades', 'programacao', 1),
('habilidades', 'marketing_digital', 2),
('habilidades', 'analise_dados', 3),
('habilidades', 'gerenciamento_projetos', 4),
('habilidades', 'ux_ui_design', 5),
('habilidades', 'desenvolvimento_web', 6),
('habilidades', 'banco_dados', 7),
('habilidades', 'redacao', 8),
('habilidades', 'microsoft_office', 9),
('habilidades', 'ingles', 10),
('habilidades', 'espanhol', 11),
('habilidades', 'comunicacao', 12),
('habilidades', 'lideranca', 13),
('habilidades', 'trabalho_equipe', 14),
('habilidades', 'resolucao_problemas', 15);

-- Formações
INSERT INTO opcoes_sistema (categoria, valor, ordem) VALUES
('formacoes', 'ensino_medio', 1),
('formacoes', 'tecnico', 2),
('formacoes', 'superior', 3),
('formacoes', 'pos_graduacao', 4);

-- 2. CATEGORIAS DE AVALIAÇÃO
INSERT INTO categorias_avaliacao (nome, descricao, peso) VALUES
('Habilidades Técnicas', 'Avaliação das habilidades técnicas específicas da área de atuação', 3),
('Comunicação', 'Avaliação da capacidade de comunicação verbal e escrita', 2),
('Trabalho em Equipe', 'Avaliação da capacidade de trabalhar em grupo e colaborar', 2),
('Proatividade', 'Avaliação da iniciativa e capacidade de resolver problemas', 2),
('Adaptabilidade', 'Avaliação da capacidade de se adaptar a mudanças e novos desafios', 1);

-- 3. USUÁRIOS
INSERT INTO usuarios (email, senha, nome, papel, verificado) VALUES
('ana.martins@techx.com', '$2b$10$QsIWkk5afvFzen/OjOk1FepQrjlVZ1gYruBRnx0IfPewG.Hy6F6ye', 'Ana Martins', 'chefe_empresa', true),
('carlos.souza@foodnow.com', '$2b$10$QsIWkk5afvFzen/OjOk1FepQrjlVZ1gYruBRnx0IfPewG.Hy6F6ye', 'Carlos Souza', 'chefe_empresa', true),
('maria.lima@etecsp.edu.br', '$2b$10$QsIWkk5afvFzen/OjOk1FepQrjlVZ1gYruBRnx0IfPewG.Hy6F6ye', 'Maria Lima', 'instituicao_ensino', true),
('joao.pereira@ongtalentos.org', '$2b$10$QsIWkk5afvFzen/OjOk1FepQrjlVZ1gYruBRnx0IfPewG.Hy6F6ye', 'João Pereira', 'instituicao_contratante', true);

-- 4. PERFIS
-- Instituições de ensino
INSERT INTO instituicoes_ensino (usuario_id, tipo, nome, localizacao, qtd_alunos, areas_ensino) VALUES
((SELECT id FROM usuarios WHERE email = 'maria.lima@etecsp.edu.br'), 'Técnica', 'ETEC São Paulo', 'São Paulo', 1200, ARRAY['Tecnologia', 'Administração']);
-- Chefes de empresa
INSERT INTO chefes_empresas (usuario_id, empresa, cargo, setor, porte, localizacao, areas_atuacao) VALUES
((SELECT id FROM usuarios WHERE email = 'ana.martins@techx.com'), 'TechX', 'CTO', 'Tecnologia', 'grande', 'São Paulo', ARRAY['Desenvolvimento', 'Inovação']),
((SELECT id FROM usuarios WHERE email = 'carlos.souza@foodnow.com'), 'FoodNow', 'CEO', 'Alimentação', 'media', 'Rio de Janeiro', ARRAY['Gestão', 'Operações']);
-- Instituições contratantes
INSERT INTO instituicoes_contratantes (usuario_id, tipo, nome, localizacao, areas_interesse, programas_sociais) VALUES
((SELECT id FROM usuarios WHERE email = 'joao.pereira@ongtalentos.org'), 'ONG', 'ONG Talentos do Futuro', 'Belo Horizonte', ARRAY['Educação', 'Tecnologia'], ARRAY['Jovem Aprendiz', 'Estágio']);

-- 5. JOVENS
INSERT INTO jovens (nome, email, idade, formacao, curso, habilidades, interesses, planos_futuros, status) VALUES
('João Silva', 'joao.silva@example.com', 18, 'Ensino Médio', 'Técnico em Informática', ARRAY['HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'Git', 'Metodologias Ágeis'], ARRAY['Desenvolvimento Web', 'Programação', 'Tecnologia', 'Inovação'], 'Busco uma oportunidade como desenvolvedor web júnior para aplicar meus conhecimentos em React e Node.js, e crescer profissionalmente na área de tecnologia.', 'Ativo'),
('Maria Oliveira', 'maria.oliveira@example.com', 20, 'Superior', 'Engenharia de Software', ARRAY['Java', 'Spring Boot', 'React', 'TypeScript', 'Docker', 'AWS', 'Testes Automatizados'], ARRAY['Desenvolvimento de Software', 'Arquitetura de Sistemas', 'Cloud Computing'], 'Pretendo me especializar em arquitetura de software e desenvolvimento de sistemas escaláveis, contribuindo para projetos inovadores.', 'Ativo'),
('Pedro Santos', 'pedro.santos@example.com', 19, 'Ensino Médio', 'Técnico em Administração', ARRAY['Excel Avançado', 'Power BI', 'Gestão de Projetos', 'Atendimento ao Cliente', 'Comunicação Empresarial'], ARRAY['Administração', 'Gestão', 'Empreendedorismo', 'Marketing Digital'], 'Busco uma oportunidade em gestão de projetos ou assistente administrativo para desenvolver minhas habilidades e contribuir para o crescimento da empresa.', 'Ativo'),
('Ana Costa', 'ana.costa@example.com', 21, 'Superior', 'Psicologia', ARRAY['Avaliação Psicológica', 'Orientação Profissional', 'Desenvolvimento Humano', 'Gestão de Pessoas', 'Comunicação Interpessoal'], ARRAY['Psicologia Organizacional', 'Desenvolvimento Pessoal', 'Educação', 'Saúde Mental'], 'Pretendo atuar na área de psicologia organizacional, contribuindo para o desenvolvimento de pessoas e a saúde mental no ambiente de trabalho.', 'Ativo'),
('Lucas Pereira', 'lucas.pereira@example.com', 17, 'Ensino Médio', 'Técnico em Mecatrônica', ARRAY['Automação Industrial', 'Programação de CLPs', 'Eletrônica', 'Robótica', 'Manutenção Preventiva'], ARRAY['Automação', 'Robótica', 'Indústria 4.0', 'Inovação Tecnológica'], 'Busco uma oportunidade como técnico em mecatrônica para aplicar meus conhecimentos em automação industrial e contribuir para a modernização dos processos produtivos.', 'Ativo');

-- 6. VÍNCULOS (exemplo: jovens_instituicoes)
INSERT INTO jovens_instituicoes (jovem_id, instituicao_id, status, data_inicio) VALUES
((SELECT id FROM jovens WHERE email = 'joao.silva@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'maria.oliveira@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'pedro.santos@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'ana.costa@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'lucas.pereira@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01');

-- 7. OPORTUNIDADES
INSERT INTO oportunidades (titulo, descricao, tipo, area, requisitos, beneficios, salario, local, status, empresa_id, data_inicio, data_fim, vagas_disponiveis) VALUES
('Estágio em Front-end', 'Buscamos jovem com vontade de aprender e interesse em desenvolvimento web para atuar com React.', 'Estágio', 'Desenvolvimento de Software', ARRAY['HTML', 'CSS', 'JavaScript', 'React'], ARRAY['Vale Transporte', 'Vale Refeição'], 'R$ 1.500,00', 'Remoto', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), '2024-06-01', '2024-12-01', 2),
('Analista de Qualidade Júnior', 'Vaga para atuar em controle de qualidade de alimentos em indústria moderna.', 'CLT', 'Qualidade', ARRAY['Excel', 'Gestão', 'Comunicação'], ARRAY['Plano de Saúde', 'Vale Alimentação'], 'R$ 2.800,00', 'Presencial - RJ', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'FoodNow'), '2024-06-10', '2024-12-10', 1),
('Estágio em Psicologia Organizacional', 'Acompanhar projetos de desenvolvimento humano e clima organizacional.', 'Estágio', 'Recursos Humanos', ARRAY['Psicologia', 'Comunicação', 'Empatia'], ARRAY['Vale Transporte', 'Bolsa Auxílio'], 'R$ 1.200,00', 'Presencial - SP', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), '2024-07-01', '2024-12-31', 1);

-- Exemplos adicionais de oportunidades úteis
INSERT INTO oportunidades (titulo, descricao, tipo, area, requisitos, beneficios, salario, local, status, empresa_id, data_inicio, data_fim, vagas_disponiveis) VALUES
('Estágio em Análise de Dados', 'Auxiliar na coleta, tratamento e análise de dados para apoiar decisões estratégicas.', 'estagio', 'analise_dados', ARRAY['Excel', 'Python', 'Power BI', 'Raciocínio lógico'], ARRAY['Vale Transporte', 'Bolsa Auxílio', 'Seguro de Vida'], 'R$ 1.200,00', 'Remoto', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), '2024-08-01', '2025-01-31', 3),
('Desenvolvedor Back-end Júnior', 'Atuar no desenvolvimento e manutenção de APIs e sistemas internos.', 'clt', 'desenvolvimento_software', ARRAY['Node.js', 'PostgreSQL', 'APIs REST', 'Git'], ARRAY['Plano de Saúde', 'Vale Refeição', 'Auxílio Home Office'], 'R$ 3.000,00', 'Híbrido - São Paulo', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), '2024-09-01', '2025-09-01', 2),
('Analista de Marketing Digital', 'Planejar e executar campanhas digitais, análise de métricas e SEO.', 'clt', 'marketing_digital', ARRAY['Google Ads', 'SEO', 'Redes Sociais', 'Analytics'], ARRAY['Vale Transporte', 'Vale Alimentação', 'Day Off Aniversário'], 'R$ 2.500,00', 'Presencial - Belo Horizonte', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'FoodNow'), '2024-08-15', '2025-08-15', 1),
('Estágio em Engenharia Mecânica', 'Acompanhar projetos de manutenção e automação industrial.', 'estagio', 'engenharia_mecanica', ARRAY['AutoCAD', 'SolidWorks', 'Noções de manutenção'], ARRAY['Vale Transporte', 'Refeitório no local'], 'R$ 1.100,00', 'Presencial - Campinas', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'FoodNow'), '2024-09-10', '2025-03-10', 2),
('Assistente Administrativo', 'Auxiliar nas rotinas administrativas, atendimento e organização de documentos.', 'clt', 'administracao', ARRAY['Pacote Office', 'Organização', 'Boa comunicação'], ARRAY['Vale Transporte', 'Vale Alimentação'], 'R$ 1.800,00', 'Presencial - Rio de Janeiro', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'FoodNow'), '2024-08-20', '2025-02-20', 1),
('Designer Gráfico Freelancer', 'Criação de peças para redes sociais e campanhas digitais.', 'freelancer', 'design_grafico', ARRAY['Photoshop', 'Illustrator', 'Portfólio'], ARRAY['Horário Flexível'], 'A combinar', 'Remoto', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), '2024-08-05', '2024-12-31', 1),
('Estágio em Psicologia Escolar', 'Apoiar projetos de orientação e acompanhamento de alunos.', 'estagio', 'psicologia', ARRAY['Cursando Psicologia', 'Empatia', 'Boa comunicação'], ARRAY['Vale Transporte', 'Bolsa Auxílio'], 'R$ 1.000,00', 'Presencial - São Paulo', 'Aberta', (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), '2024-08-20', '2025-01-20', 1);

-- 8. HISTÓRICO DE DESENVOLVIMENTO
INSERT INTO historico_desenvolvimento (jovem_id, tipo, titulo, descricao, data_inicio, data_conclusao, instituicao, comprovante_url, validado) VALUES
((SELECT id FROM jovens WHERE email = 'joao.silva@example.com'), 'certificacao', 'Certificação em Desenvolvimento Web', 'Curso completo de desenvolvimento web com foco em React e Node.js', '2023-12-01', '2024-01-15', 'Alura', 'https://exemplo.com/certificado1.pdf', true),
((SELECT id FROM jovens WHERE email = 'joao.silva@example.com'), 'projeto', 'E-commerce Responsivo', 'Desenvolvimento de loja virtual responsiva usando React e Node.js', '2024-01-01', '2024-02-15', 'Projeto Pessoal', 'https://exemplo.com/projeto1.pdf', true),
((SELECT id FROM jovens WHERE email = 'maria.oliveira@example.com'), 'curso', 'UX/UI Design', 'Curso completo de design de interfaces e experiência do usuário', '2023-11-01', '2024-01-30', 'Coursera', 'https://exemplo.com/certificado2.pdf', true),
((SELECT id FROM jovens WHERE email = 'maria.oliveira@example.com'), 'projeto', 'Redesign de Aplicativo', 'Redesign completo de aplicativo mobile com foco em acessibilidade', '2024-01-15', '2024-02-28', 'Projeto Acadêmico', 'https://exemplo.com/projeto2.pdf', true),
((SELECT id FROM jovens WHERE email = 'pedro.santos@example.com'), 'certificacao', 'Gestão de Projetos', 'Certificação em metodologias ágeis e gestão de projetos', '2023-10-01', '2023-12-15', 'PMI', 'https://exemplo.com/certificado3.pdf', true),
((SELECT id FROM jovens WHERE email = 'pedro.santos@example.com'), 'projeto', 'Sistema de Gestão Escolar', 'Desenvolvimento de sistema para gestão de matrículas e notas', '2024-01-01', '2024-02-15', 'Projeto Acadêmico', 'https://exemplo.com/projeto3.pdf', true),
((SELECT id FROM jovens WHERE email = 'ana.costa@example.com'), 'curso', 'Psicologia Organizacional', 'Especialização em psicologia aplicada ao ambiente corporativo', '2023-09-01', '2024-01-30', 'PUC-SP', 'https://exemplo.com/certificado4.pdf', true),
((SELECT id FROM jovens WHERE email = 'ana.costa@example.com'), 'projeto', 'Programa de Desenvolvimento Pessoal', 'Implementação de programa de mentoria para jovens em situação de vulnerabilidade', '2024-01-01', '2024-02-28', 'Projeto Social', 'https://exemplo.com/projeto4.pdf', true),
((SELECT id FROM jovens WHERE email = 'lucas.pereira@example.com'), 'certificacao', 'Automação Industrial', 'Certificação em programação de CLPs e sistemas de automação', '2023-11-01', '2024-01-15', 'SENAI', 'https://exemplo.com/certificado5.pdf', true),
((SELECT id FROM jovens WHERE email = 'lucas.pereira@example.com'), 'projeto', 'Sistema de Controle de Qualidade', 'Desenvolvimento de sistema automatizado para controle de qualidade', '2024-01-01', '2024-02-15', 'Projeto Acadêmico', 'https://exemplo.com/projeto5.pdf', true);

-- 9. AVALIAÇÕES
INSERT INTO avaliacoes (jovem_id, avaliador_tipo, avaliador_id, categoria_id, nota, comentario, evidencias) VALUES
((SELECT id FROM jovens WHERE email = 'joao.silva@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), (SELECT id FROM categorias_avaliacao WHERE nome = 'Habilidades Técnicas'), 9.0, 'Excelente domínio das tecnologias web, especialmente em React e Node.js', ARRAY['https://exemplo.com/projeto1.pdf']),
((SELECT id FROM jovens WHERE email = 'joao.silva@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), (SELECT id FROM categorias_avaliacao WHERE nome = 'Comunicação'), 8.5, 'Boa comunicação em apresentações de projetos', ARRAY['https://exemplo.com/apresentacao.pdf']),
((SELECT id FROM jovens WHERE email = 'maria.oliveira@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), (SELECT id FROM categorias_avaliacao WHERE nome = 'Habilidades Técnicas'), 9.5, 'Maria tem domínio avançado em arquitetura de software', ARRAY['https://exemplo.com/arquitetura.pdf']),
((SELECT id FROM jovens WHERE email = 'maria.oliveira@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), (SELECT id FROM categorias_avaliacao WHERE nome = 'Trabalho em Equipe'), 9.0, 'Ótima liderança em projetos de grupo', ARRAY['https://exemplo.com/lideranca.pdf']),
((SELECT id FROM jovens WHERE email = 'pedro.santos@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), (SELECT id FROM categorias_avaliacao WHERE nome = 'Proatividade'), 8.5, 'Pedro sempre se antecipa às necessidades do time', ARRAY['https://exemplo.com/proatividade.pdf']),
((SELECT id FROM jovens WHERE email = 'ana.costa@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), (SELECT id FROM categorias_avaliacao WHERE nome = 'Comunicação'), 9.5, 'Ana tem excelente escuta ativa e empatia', ARRAY['https://exemplo.com/empatia.pdf']),
((SELECT id FROM jovens WHERE email = 'lucas.pereira@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), (SELECT id FROM categorias_avaliacao WHERE nome = 'Habilidades Técnicas'), 9.0, 'Lucas domina automação industrial e robótica', ARRAY['https://exemplo.com/robotica.pdf']),
((SELECT id FROM jovens WHERE email = 'lucas.pereira@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), (SELECT id FROM categorias_avaliacao WHERE nome = 'Trabalho em Equipe'), 8.5, 'Trabalha bem em times multidisciplinares', ARRAY['https://exemplo.com/time.pdf']);

-- 10. RECOMENDAÇÕES
INSERT INTO recomendacoes (jovem_id, oportunidade_id, recomendador_tipo, recomendador_id, justificativa, status) VALUES
((SELECT id FROM jovens WHERE email = 'joao.silva@example.com'), (SELECT id FROM oportunidades WHERE titulo = 'Estágio em Front-end'), 'chefe_empresa', (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), 'João se destacou em projetos pessoais e tem facilidade para aprender novas tecnologias.', 'pendente'),
((SELECT id FROM jovens WHERE email = 'maria.oliveira@example.com'), (SELECT id FROM oportunidades WHERE titulo = 'Estágio em Front-end'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'Maria é referência em desenvolvimento de software e sempre ajuda colegas.', 'pendente'),
((SELECT id FROM jovens WHERE email = 'pedro.santos@example.com'), (SELECT id FROM oportunidades WHERE titulo = 'Assistente Administrativo'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'Pedro é muito organizado e proativo, ideal para rotinas administrativas.', 'pendente'),
((SELECT id FROM jovens WHERE email = 'ana.costa@example.com'), (SELECT id FROM oportunidades WHERE titulo = 'Estágio em Psicologia Organizacional'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'Ana tem perfil humanizado e já liderou projetos de mentoria.', 'pendente'),
((SELECT id FROM jovens WHERE email = 'lucas.pereira@example.com'), (SELECT id FROM oportunidades WHERE titulo = 'Analista de Qualidade Júnior'), 'chefe_empresa', (SELECT id FROM chefes_empresas WHERE empresa = 'FoodNow'), 'Lucas é detalhista e tem experiência prática em controle de qualidade.', 'pendente');

-- 11. VÍNCULOS DE JOVENS COM EMPRESAS (para estatísticas do dashboard)
INSERT INTO jovens_chefes_empresas (jovem_id, chefe_empresa_id, status, data_inicio) VALUES
((SELECT id FROM jovens WHERE email = 'joao.silva@example.com'), (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), 'Contratado', '2024-07-01'),
((SELECT id FROM jovens WHERE email = 'maria.oliveira@example.com'), (SELECT id FROM chefes_empresas WHERE empresa = 'TechX'), 'Estagiário', '2024-07-10'),
((SELECT id FROM jovens WHERE email = 'lucas.pereira@example.com'), (SELECT id FROM chefes_empresas WHERE empresa = 'FoodNow'), 'Contratado', '2024-07-15');

-- Novos jovens para oportunidades criadas

-- 1. JOVENS
INSERT INTO jovens (nome, email, idade, formacao, curso, habilidades, interesses, planos_futuros, status) VALUES
('Bruna Almeida', 'bruna.almeida@example.com', 22, 'Superior', 'Engenharia Mecânica', ARRAY['AutoCAD', 'SolidWorks', 'Noções de manutenção'], ARRAY['Engenharia Mecânica', 'Automação'], 'Quero atuar em projetos de manutenção e automação industrial.', 'Ativo'),
('Felipe Torres', 'felipe.torres@example.com', 20, 'Superior', 'Ciência da Computação', ARRAY['Node.js', 'PostgreSQL', 'APIs REST', 'Git'], ARRAY['Desenvolvimento Back-end', 'APIs'], 'Busco crescer como desenvolvedor back-end em projetos inovadores.', 'Ativo'),
('Juliana Ramos', 'juliana.ramos@example.com', 19, 'Superior', 'Publicidade e Propaganda', ARRAY['Google Ads', 'SEO', 'Redes Sociais', 'Analytics'], ARRAY['Marketing Digital', 'Comunicação'], 'Quero me especializar em campanhas digitais e análise de métricas.', 'Ativo'),
('Rafael Lima', 'rafael.lima@example.com', 18, 'Técnico', 'Técnico em Administração', ARRAY['Pacote Office', 'Organização', 'Boa comunicação'], ARRAY['Administração', 'Gestão'], 'Pretendo atuar em rotinas administrativas e atendimento.', 'Ativo'),
('Camila Souza', 'camila.souza@example.com', 21, 'Superior', 'Design Gráfico', ARRAY['Photoshop', 'Illustrator', 'Portfólio'], ARRAY['Design Gráfico', 'Criação'], 'Quero trabalhar com criação de peças para redes sociais.', 'Ativo'),
('Eduardo Martins', 'eduardo.martins@example.com', 20, 'Superior', 'Psicologia', ARRAY['Cursando Psicologia', 'Empatia', 'Boa comunicação'], ARRAY['Psicologia Escolar', 'Educação'], 'Busco experiência em psicologia escolar e orientação de alunos.', 'Ativo'),
('Larissa Figueiredo', 'larissa.figueiredo@example.com', 21, 'Superior', 'Estatística', ARRAY['Excel', 'Python', 'Power BI', 'Raciocínio lógico'], ARRAY['Análise de Dados', 'Tecnologia'], 'Quero atuar em análise de dados para apoiar decisões estratégicas.', 'Ativo');

-- 2. VÍNCULOS COM INSTITUIÇÃO DE ENSINO
INSERT INTO jovens_instituicoes (jovem_id, instituicao_id, status, data_inicio) VALUES
((SELECT id FROM jovens WHERE email = 'bruna.almeida@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'felipe.torres@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'juliana.ramos@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'rafael.lima@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'camila.souza@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'eduardo.martins@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01'),
((SELECT id FROM jovens WHERE email = 'larissa.figueiredo@example.com'), (SELECT id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 'aprovado', '2024-01-01');

-- 3. HISTÓRICO DE DESENVOLVIMENTO
INSERT INTO historico_desenvolvimento (jovem_id, tipo, titulo, descricao, data_inicio, data_conclusao, instituicao, comprovante_url, validado) VALUES
((SELECT id FROM jovens WHERE email = 'bruna.almeida@example.com'), 'curso', 'Projeto de Automação', 'Participação em projeto de automação industrial com uso de SolidWorks.', '2023-08-01', '2023-12-01', 'SENAI', 'https://exemplo.com/certificado_bruna.pdf', true),
((SELECT id FROM jovens WHERE email = 'felipe.torres@example.com'), 'certificacao', 'Certificação Node.js', 'Curso intensivo de desenvolvimento back-end com Node.js.', '2023-09-01', '2023-11-30', 'Alura', 'https://exemplo.com/certificado_felipe.pdf', true),
((SELECT id FROM jovens WHERE email = 'juliana.ramos@example.com'), 'projeto', 'Campanha Digital', 'Planejamento e execução de campanha digital para ONG.', '2023-10-01', '2023-12-15', 'Projeto Acadêmico', 'https://exemplo.com/certificado_juliana.pdf', true),
((SELECT id FROM jovens WHERE email = 'rafael.lima@example.com'), 'curso', 'Gestão Administrativa', 'Curso de rotinas administrativas e atendimento ao cliente.', '2023-07-01', '2023-09-30', 'SENAC', 'https://exemplo.com/certificado_rafael.pdf', true),
((SELECT id FROM jovens WHERE email = 'camila.souza@example.com'), 'projeto', 'Portfólio de Design', 'Desenvolvimento de portfólio com peças para redes sociais.', '2023-11-01', '2023-12-20', 'Projeto Pessoal', 'https://exemplo.com/certificado_camila.pdf', true),
((SELECT id FROM jovens WHERE email = 'eduardo.martins@example.com'), 'curso', 'Psicologia Escolar', 'Curso de extensão em psicologia escolar.', '2023-09-01', '2023-12-01', 'USP', 'https://exemplo.com/certificado_eduardo.pdf', true),
((SELECT id FROM jovens WHERE email = 'larissa.figueiredo@example.com'), 'certificacao', 'Análise de Dados com Python', 'Certificação em análise de dados utilizando Python e Power BI.', '2023-10-01', '2023-12-15', 'Coursera', 'https://exemplo.com/certificado_larissa.pdf', true);

-- 4. AVALIAÇÕES (usando categorias já existentes)
INSERT INTO avaliacoes (jovem_id, avaliador_tipo, avaliador_id, categoria_id, nota, comentario, criado_em) VALUES
((SELECT id FROM jovens WHERE email = 'bruna.almeida@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 1, 9, 'Ótima desenvoltura em projetos de automação.', '2024-03-01'),
((SELECT id FROM jovens WHERE email = 'felipe.torres@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 1, 10, 'Excelente domínio de back-end.', '2024-03-01'),
((SELECT id FROM jovens WHERE email = 'juliana.ramos@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 2, 9, 'Muito criativa em campanhas digitais.', '2024-03-01'),
((SELECT id FROM jovens WHERE email = 'rafael.lima@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 3, 8, 'Bom trabalho em equipe e organização.', '2024-03-01'),
((SELECT id FROM jovens WHERE email = 'camila.souza@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 5, 10, 'Ótima criatividade e domínio de ferramentas de design.', '2024-03-01'),
((SELECT id FROM jovens WHERE email = 'eduardo.martins@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 2, 9, 'Excelente comunicação e empatia.', '2024-03-01'),
((SELECT id FROM jovens WHERE email = 'larissa.figueiredo@example.com'), 'instituicao_ensino', (SELECT usuario_id FROM instituicoes_ensino WHERE nome = 'ETEC São Paulo'), 1, 10, 'Grande potencial em análise de dados.', '2024-03-01'); 