import type { Conversa } from '../types'

export const CONVERSAS: Conversa[] = [
  {
    id: 'aline',
    nome: 'Aline Cardoso',
    iniciais: 'AC',
    cor: '#e8bfd0',
    naoLidas: 2,
    mensagens: [
      { id: 'aline-1', autor: 'cliente', texto: 'oi bom dia! qnt ta o pacote de laser de 10?', min: 11520 },
      { id: 'aline-2', autor: 'loja', texto: 'Bom dia Aline! O pacote de 10 sessoes sai 1.050 💛', min: 11460 },
      { id: 'aline-3', autor: 'cliente', texto: 'nossa achei um pouco salgado', min: 11400 },
      { id: 'aline-4', autor: 'cliente', texto: 'consegue fazer por 900?', min: 11395 },
      { id: 'aline-5', autor: 'loja', texto: 'Consigo 980 no pix, fecha?', min: 11340 },
      { id: 'aline-6', autor: 'cliente', texto: 'deixa eu ver aqui e te falo', min: 11280 }
    ],
    compromisso: {
      itens: [{ descricao: 'Pacote 10 sessoes depilacao a laser', valor: 1050 }],
      valorTotal: 1050,
      estado: 'travado',
      motivo: 'preco',
      temperatura: 'morno',
      confianca: 0.62,
      toques: [{ min: 8640, angulo: 'desconto', respondeu: false }]
    }
  },
  {
    id: 'tati',
    nome: 'Tatiane Moraes',
    iniciais: 'TM',
    cor: '#c9b6e4',
    naoLidas: 1,
    mensagens: [
      { id: 'tati-1', autor: 'cliente', texto: 'oi amor tudo bem? eh que eu queria saber se vc ainda ta fazendo aquele pacote de laser que a gente conversou mes passado pq eu recebi agora e queria ja comecar mas nao sei se o valor eh o mesmo ainda viu', min: 4320, audio: 41 },
      { id: 'tati-2', autor: 'loja', texto: 'Oii Tati! Continua sim, 1.050 nas 10 sessoes 😊', min: 4260 },
      { id: 'tati-3', autor: 'cliente', texto: 'blz vou falar com meu marido e te confirmo hj a noite', min: 4200 }
    ],
    compromisso: {
      itens: [{ descricao: 'Pacote 10 sessoes depilacao a laser', valor: 1050 }],
      valorTotal: 1050,
      estado: 'travado',
      motivo: 'terceiro',
      temperatura: 'quente',
      confianca: 0.71,
      toques: []
    }
  },
  {
    id: 'bruna',
    nome: 'Bruna Sampaio',
    iniciais: 'BS',
    cor: '#e8c07d',
    naoLidas: 1,
    mensagens: [
      { id: 'bruna-1', autor: 'cliente', texto: 'oii queria fazer a micro de sobrancelha', min: 20160 },
      { id: 'bruna-2', autor: 'loja', texto: 'Que delicia Bruna! Micropigmentacao 650, ja com o retoque', min: 20100 },
      { id: 'bruna-3', autor: 'cliente', texto: 'aaa 650 ta fora do meu orcamento agora', min: 20040 },
      { id: 'bruna-4', autor: 'cliente', texto: 'parcela em quantas?', min: 20035 },
      { id: 'bruna-5', autor: 'loja', texto: 'Parcelo em ate 4x sem juros no cartao 🙏', min: 19980 },
      { id: 'bruna-6', autor: 'cliente', texto: 'hmm vou pensar obg', min: 19900 }
    ],
    compromisso: {
      itens: [{ descricao: 'Micropigmentacao de sobrancelha', valor: 650 }],
      valorTotal: 650,
      estado: 'travado',
      motivo: 'preco',
      temperatura: 'frio',
      confianca: 0.38,
      toques: [
        { min: 14400, angulo: 'facilita_pagamento', respondeu: false },
        { min: 7200, angulo: 'lembrete_simples', respondeu: false }
      ]
    }
  },
  {
    id: 'juliana',
    nome: 'Juliana Prado',
    iniciais: 'JP',
    cor: '#8ec5e8',
    naoLidas: 3,
    mensagens: [
      { id: 'juliana-1', autor: 'cliente', texto: 'oi! parei o pacote de massagem no meio do ano', min: 43200 },
      { id: 'juliana-2', autor: 'cliente', texto: 'quantas sessoes ainda tenho ai?', min: 43190 },
      { id: 'juliana-3', autor: 'loja', texto: 'Oi Ju! Vc fez 6 de 10, sobram 4 sessoes 💛', min: 43140 },
      { id: 'juliana-4', autor: 'cliente', texto: 'aaa que bom achei que tinha perdido', min: 43080 },
      { id: 'juliana-5', autor: 'cliente', texto: 'semana que vem eu marco', min: 43070 }
    ],
    compromisso: {
      itens: [{ descricao: '4 sessoes restantes do pacote de massagem modeladora', valor: 392 }],
      valorTotal: 392,
      estado: 'travado',
      motivo: 'pacote_parado',
      temperatura: 'morno',
      confianca: 0.55,
      toques: [{ min: 21600, angulo: 'retomada_pacote', respondeu: false }]
    }
  },
  {
    id: 'renata',
    nome: 'Renata Aguiar',
    iniciais: 'RA',
    cor: '#b8d8c0',
    naoLidas: 1,
    mensagens: [
      { id: 'renata-1', autor: 'cliente', texto: 'oi! eu tinha marcado limpeza + hidratacao pra quinta, consigo passar pra outro dia?', min: 13_000 },
      { id: 'renata-2', autor: 'loja', texto: 'Oi Renata! Consigo sim, me fala qual dia fica melhor 😊', min: 12_940 },
      { id: 'renata-3', autor: 'cliente', texto: 'deixa eu ver como fica minha semana e ja te falo', min: 12_900 },
      { id: 'renata-4', autor: 'cliente', texto: 'ainda da tempo de remarcar?', min: 9_400 }
    ],
    compromisso: {
      itens: [
        { descricao: 'Limpeza de pele profunda', valor: 140 },
        { descricao: 'Hidratacao facial', valor: 140 }
      ],
      valorTotal: 280,
      estado: 'travado',
      motivo: 'sumico_pos_acordo',
      temperatura: 'quente',
      confianca: 0.78,
      toques: [{ min: 7200, angulo: 'lembrete_simples', respondeu: false }]
    }
  },
  {
    id: 'carol',
    nome: 'Carolina Bittencourt',
    iniciais: 'CB',
    cor: '#e8a3a3',
    naoLidas: 1,
    mensagens: [
      { id: 'carol-1', autor: 'cliente', texto: 'boa tarde, voces abrem sabado?', min: 2880 },
      { id: 'carol-2', autor: 'loja', texto: 'Abrimos sim! Sabado das 9 as 17 😊', min: 2820 },
      { id: 'carol-3', autor: 'cliente', texto: 'perfeito, sabado que vem 10h da pra limpeza de pele?', min: 2760 },
      { id: 'carol-4', autor: 'loja', texto: 'Da sim, ja deixei separado pra vc. 140 a limpeza profunda', min: 2700 },
      { id: 'carol-5', autor: 'cliente', texto: 'fechado! obg ❤️', min: 2640 }
    ]
  },
  {
    id: 'patricia',
    nome: 'Patricia Almeida',
    iniciais: 'PA',
    cor: '#a8d5a2',
    naoLidas: 0,
    mensagens: [
      { id: 'patricia-1', autor: 'cliente', texto: 'oi, quanto ta o peeling de diamante?', min: 8640 },
      { id: 'patricia-2', autor: 'loja', texto: 'Oi Patricia! Peeling de diamante 280 a sessao', min: 8580 }
    ],
    compromisso: {
      itens: [{ descricao: 'Peeling de diamante', valor: 280 }],
      valorTotal: 280,
      estado: 'orcado',
      temperatura: 'morno',
      confianca: 0.48,
      toques: []
    }
  },
  {
    id: 'vanessa',
    nome: 'Vanessa Loureiro',
    iniciais: 'VL',
    cor: '#b9c8d6',
    naoLidas: 2,
    mensagens: [
      { id: 'vanessa-1', autor: 'cliente', texto: 'oi voces aceitam cartao?', min: 15840 },
      { id: 'vanessa-2', autor: 'cliente', texto: 'debito tbm?', min: 15830 }
    ]
  },
  {
    id: 'camila',
    nome: 'Camila Ferraz',
    iniciais: 'CF',
    cor: '#f0cba0',
    naoLidas: 4,
    mensagens: [
      { id: 'camila-1', autor: 'cliente', texto: 'oi! fechei o combo limpeza + hidratacao com a menina ai', min: 10080 },
      { id: 'camila-2', autor: 'loja', texto: 'Isso Camila, 190 o combo. Marcamos quinta 15h?', min: 10020 },
      { id: 'camila-3', autor: 'cliente', texto: 'pode ser quinta sim', min: 9960 },
      { id: 'camila-4', autor: 'loja', texto: 'Anotado! Te mando o pix pra confirmar 😊', min: 9900 },
      { id: 'camila-5', autor: 'cliente', texto: 'ta bom ja mando', min: 9840 }
    ],
    compromisso: {
      itens: [{ descricao: 'Combo limpeza + hidratacao', valor: 190 }],
      valorTotal: 190,
      estado: 'acordado',
      temperatura: 'quente',
      confianca: 0.74,
      toques: [{ min: 7200, angulo: 'lembrete_simples', respondeu: false }]
    }
  },
  {
    id: 'debora',
    nome: 'Debora Nunes',
    iniciais: 'DN',
    cor: '#9ecfd8',
    naoLidas: 1,
    mensagens: [
      { id: 'debora-1', autor: 'cliente', texto: 'qual o endereco de vcs mesmo?', min: 7200 },
      { id: 'debora-2', autor: 'cliente', texto: 'eh perto do metro fradique?', min: 7190 }
    ]
  },
  {
    id: 'larissa',
    nome: 'Larissa Peçanha',
    iniciais: 'LP',
    cor: '#a7c7e7',
    naoLidas: 2,
    mensagens: [
      { id: 'larissa-1', autor: 'cliente', texto: 'oi linda, boa noite, entao eu comprei aquele pacote de dez sessoes de laser no comeco do ano e eu parei na quinta sessao porque eu viajei a trabalho e acabei nao voltando mais, queria saber se ainda da pra eu usar as que sobraram ou se venceu ja', min: 64800, audio: 47 },
      { id: 'larissa-2', autor: 'loja', texto: 'Oii Lari! Nao vence nao, vc tem 5 sessoes guardadas aqui 💛', min: 64740 },
      { id: 'larissa-3', autor: 'cliente', texto: 'aaa que alivio', min: 64680 },
      { id: 'larissa-4', autor: 'cliente', texto: 'te chamo pra marcar', min: 64670 }
    ],
    compromisso: {
      itens: [{ descricao: '5 sessoes restantes do pacote de laser', valor: 525 }],
      valorTotal: 525,
      estado: 'travado',
      motivo: 'pacote_parado',
      temperatura: 'frio',
      confianca: 0.42,
      toques: [
        { min: 43200, angulo: 'retomada_pacote', respondeu: false },
        { min: 20160, angulo: 'escassez', respondeu: false },
        { min: 2880, angulo: 'escassez', respondeu: false }
      ]
    }
  },
  {
    id: 'sabrina',
    nome: 'Sabrina Toledo',
    iniciais: 'ST',
    cor: '#e8bfd0',
    naoLidas: 0,
    mensagens: [
      { id: 'sabrina-1', autor: 'cliente', texto: 'oi! vou de novo naquele combo', min: 1440 },
      { id: 'sabrina-2', autor: 'loja', texto: 'Aeee Sabrina! Sexta 11h ta livre 💛', min: 1380 },
      { id: 'sabrina-3', autor: 'cliente', texto: 'fechado, ja to com saudade da minha pele kkkk', min: 1320 },
      { id: 'sabrina-4', autor: 'loja', texto: 'Te espero! Qualquer coisa me avisa 😊', min: 1260 }
    ]
  },
  {
    id: 'priscila',
    nome: 'Priscila Andrade',
    iniciais: 'PA',
    cor: '#c9b6e4',
    naoLidas: 0,
    mensagens: [
      { id: 'priscila-1', autor: 'cliente', texto: 'oi, quero fechar o pacote de massagem modeladora', min: 17280 },
      { id: 'priscila-2', autor: 'loja', texto: 'Boa Pri! Pacote 10 sessoes 980, sessao avulsa 120', min: 17220 },
      { id: 'priscila-3', autor: 'cliente', texto: 'fica os 980 msm? achei que tinha subido', min: 17160 },
      { id: 'priscila-4', autor: 'loja', texto: 'Segura 980 sim pra vc 🙏', min: 17100 },
      { id: 'priscila-5', autor: 'cliente', texto: 'perfeito, quero sim! me manda o pix', min: 17040 },
      { id: 'priscila-6', autor: 'loja', texto: 'Mandei ai! Assim que cair ja marco a primeira', min: 16980 }
    ],
    compromisso: {
      itens: [{ descricao: 'Pacote 10 sessoes massagem modeladora', valor: 980 }],
      valorTotal: 980,
      estado: 'acordado',
      motivo: 'sumico_pos_acordo',
      temperatura: 'quente',
      confianca: 0.81,
      toques: [{ min: 10080, angulo: 'lembrete_simples', respondeu: false }]
    }
  },
  {
    id: 'monica',
    nome: 'Monica Rabelo',
    iniciais: 'MR',
    cor: '#e8c07d',
    naoLidas: 0,
    mensagens: [
      { id: 'monica-1', autor: 'cliente', texto: 'oi! quanto ta a limpeza de pele profunda?', min: 12960 },
      { id: 'monica-2', autor: 'loja', texto: 'Oi Monica! 140 a limpeza profunda 😊', min: 12900 },
      { id: 'monica-3', autor: 'cliente', texto: 'e o combo com hidratacao?', min: 12840 },
      { id: 'monica-4', autor: 'loja', texto: '190 o combo, vale super a pena', min: 12780 }
    ],
    compromisso: {
      itens: [{ descricao: 'Combo limpeza + hidratacao', valor: 190 }],
      valorTotal: 190,
      estado: 'orcado',
      temperatura: 'morno',
      confianca: 0.45,
      toques: []
    }
  },
  {
    id: 'gabi',
    nome: 'Gabriela Sanches',
    iniciais: 'GS',
    cor: '#8ec5e8',
    naoLidas: 3,
    mensagens: [
      { id: 'gabi-1', autor: 'cliente', texto: 'oi tudo bem? eu vi no insta a promo do laser', min: 2880 },
      { id: 'gabi-2', autor: 'loja', texto: 'Oii Gabi! Sessao avulsa 145 ou pacote de 10 por 1.050', min: 2820 },
      { id: 'gabi-3', autor: 'cliente', texto: 'tem desconto no dinheiro?', min: 2760 },
      { id: 'gabi-4', autor: 'loja', texto: 'No pix faco 990 🙏', min: 2700 },
      { id: 'gabi-5', autor: 'cliente', texto: 'vou ver com meu marido e volto aqui', min: 2640 }
    ],
    compromisso: {
      itens: [{ descricao: 'Pacote 10 sessoes depilacao a laser', valor: 1050 }],
      valorTotal: 1050,
      estado: 'travado',
      motivo: 'terceiro',
      temperatura: 'quente',
      confianca: 0.68,
      toques: []
    }
  },
  {
    id: 'kelly',
    nome: 'Kelly Fontoura',
    iniciais: 'KF',
    cor: '#e8a3a3',
    naoLidas: 3,
    mensagens: [
      { id: 'kelly-1', autor: 'cliente', texto: 'vcs atendem ate que horas na quarta?', min: 20160 },
      { id: 'kelly-2', autor: 'cliente', texto: 'saio do trampo 19h', min: 20150 }
    ]
  },
  {
    id: 'thais',
    nome: 'Thais Bonfim',
    iniciais: 'TB',
    cor: '#a8d5a2',
    naoLidas: 4,
    mensagens: [
      { id: 'thais-1', autor: 'cliente', texto: 'oi! parei o pacote de laser faz um tempao', min: 57600 },
      { id: 'thais-2', autor: 'loja', texto: 'Oi Thais! Vc fez 7 de 10, sobram 3 sessoes 💛', min: 57540 },
      { id: 'thais-3', autor: 'cliente', texto: 'nossa nem lembrava', min: 57480 },
      { id: 'thais-4', autor: 'cliente', texto: 'to meio enrolada mas quero terminar', min: 57470 }
    ],
    compromisso: {
      itens: [{ descricao: '3 sessoes restantes do pacote de laser', valor: 315 }],
      valorTotal: 315,
      estado: 'travado',
      motivo: 'pacote_parado',
      temperatura: 'frio',
      confianca: 0.36,
      toques: [{ min: 28800, angulo: 'retomada_pacote', respondeu: false }]
    }
  },
  {
    id: 'natalia',
    nome: 'Natalia Espindola',
    iniciais: 'NE',
    cor: '#f0cba0',
    naoLidas: 0,
    mensagens: [
      { id: 'natalia-1', autor: 'cliente', texto: 'amei o resultado da limpeza 😍', min: 720 },
      { id: 'natalia-2', autor: 'loja', texto: 'Aaah que bom Nat! Fica lindona mesmo', min: 660 },
      { id: 'natalia-3', autor: 'cliente', texto: 'ja quero remarcar pro mes que vem', min: 600 },
      { id: 'natalia-4', autor: 'loja', texto: 'Deixei anotado, dia 12 as 14h ta reservado pra vc', min: 540 }
    ]
  },
  {
    id: 'elaine',
    nome: 'Elaine Vasques',
    iniciais: 'EV',
    cor: '#9ecfd8',
    naoLidas: 3,
    mensagens: [
      { id: 'elaine-1', autor: 'cliente', texto: 'oi, queria fazer drenagem 2x na semana', min: 8640 },
      { id: 'elaine-2', autor: 'loja', texto: 'Da certo! 130 cada sessao Elaine', min: 8580 },
      { id: 'elaine-3', autor: 'cliente', texto: 'ta caro pra 2x, deixa so 1x', min: 8520 },
      { id: 'elaine-4', autor: 'loja', texto: 'Sem problema, 1x por semana entao', min: 8460 },
      { id: 'elaine-5', autor: 'cliente', texto: 'na vdd esse mes ta apertado, mes que vem eu comeco', min: 8400 }
    ],
    compromisso: {
      itens: [{ descricao: 'Drenagem linfatica', valor: 130 }],
      valorTotal: 130,
      estado: 'travado',
      motivo: 'sem_grana',
      temperatura: 'frio',
      confianca: 0.34,
      toques: [{ min: 4320, angulo: 'facilita_pagamento', respondeu: false }]
    }
  },
  {
    id: 'rafaela',
    nome: 'Rafaela Coutinho',
    iniciais: 'RC',
    cor: '#a7c7e7',
    naoLidas: 0,
    mensagens: [
      { id: 'rafaela-1', autor: 'cliente', texto: 'oi! peeling de diamante ta quanto?', min: 3600 },
      { id: 'rafaela-2', autor: 'loja', texto: 'Oi Rafa! 280 a sessao 😊', min: 3540 }
    ],
    compromisso: {
      itens: [{ descricao: 'Peeling de diamante', valor: 280 }],
      valorTotal: 280,
      estado: 'orcado',
      temperatura: 'morno',
      confianca: 0.44,
      toques: []
    }
  },
  {
    id: 'joyce',
    nome: 'Joyce Mendonça',
    iniciais: 'JM',
    cor: '#d6c3b0',
    naoLidas: 1,
    mensagens: [
      { id: 'joyce-1', autor: 'cliente', texto: 'vcs tem estacionamento por perto?', min: 5040 },
      { id: 'joyce-2', autor: 'cliente', texto: 'eh dificil vaga ai na regiao ne', min: 5030 }
    ]
  },
  {
    id: 'simone',
    nome: 'Simone Aguiar',
    iniciais: 'SA',
    cor: '#e8bfd0',
    naoLidas: 0,
    mensagens: [
      { id: 'simone-1', autor: 'cliente', texto: 'boa tarde! fechei a micro com voces semana passada', min: 14400 },
      { id: 'simone-2', autor: 'loja', texto: 'Isso Simone! 650, sabado 10h ta marcado 💛', min: 14340 },
      { id: 'simone-3', autor: 'cliente', texto: 'perfeito, ja vou fazer o pix', min: 14280 },
      { id: 'simone-4', autor: 'loja', texto: 'Show! Assim que cair te confirmo', min: 14220 }
    ],
    compromisso: {
      itens: [{ descricao: 'Micropigmentacao de sobrancelha', valor: 650 }],
      valorTotal: 650,
      estado: 'acordado',
      motivo: 'sumico_pos_acordo',
      temperatura: 'quente',
      confianca: 0.78,
      toques: [
        { min: 10080, angulo: 'lembrete_simples', respondeu: false },
        { min: 5760, angulo: 'escassez', respondeu: false }
      ]
    }
  },
  {
    id: 'viviane',
    nome: 'Viviane Tanaka',
    iniciais: 'VT',
    cor: '#c9b6e4',
    naoLidas: 2,
    mensagens: [
      { id: 'viviane-1', autor: 'cliente', texto: 'oi bom dia, eu fiz umas sessoes de laser ai com voces no ano passado e parei, ai agora eu tava pensando em voltar pra fechar de vez a axila e a virilha, so que eu queria saber quanto que ta o pacote hoje porque faz tempo ne', min: 4320, audio: 39 },
      { id: 'viviane-2', autor: 'loja', texto: 'Vem Vivi! Pacote 10 por 1.050 ou avulsa 145', min: 4260 },
      { id: 'viviane-3', autor: 'cliente', texto: 'eh que agora to desempregada', min: 4200 },
      { id: 'viviane-4', autor: 'cliente', texto: 'assim que estabilizar eu fecho o pacote 🥹', min: 4190 }
    ],
    compromisso: {
      itens: [{ descricao: 'Pacote 10 sessoes depilacao a laser', valor: 1050 }],
      valorTotal: 1050,
      estado: 'travado',
      motivo: 'sem_grana',
      temperatura: 'frio',
      confianca: 0.29,
      toques: []
    }
  },
  {
    id: 'leticia',
    nome: 'Leticia Bragança',
    iniciais: 'LB',
    cor: '#e8c07d',
    naoLidas: 0,
    mensagens: [
      { id: 'leticia-1', autor: 'cliente', texto: 'oi bom dia, faz massagem modeladora?', min: 2160 },
      { id: 'leticia-2', autor: 'loja', texto: 'Faz sim Leticia! 120 avulsa, pacote de 10 sai 980', min: 2100 },
      { id: 'leticia-3', autor: 'cliente', texto: 'e o pacote pode dividir?', min: 2040 },
      { id: 'leticia-4', autor: 'loja', texto: 'Pode! 3x de 326 no cartao 😊', min: 1980 }
    ],
    compromisso: {
      itens: [{ descricao: 'Pacote 10 sessoes massagem modeladora', valor: 980 }],
      valorTotal: 980,
      estado: 'orcado',
      temperatura: 'quente',
      confianca: 0.6,
      toques: []
    }
  },
  {
    id: 'daniela',
    nome: 'Daniela Ortiz',
    iniciais: 'DO',
    cor: '#8ec5e8',
    naoLidas: 0,
    mensagens: [
      { id: 'daniela-1', autor: 'cliente', texto: 'oi, ainda tem horario amanha de manha?', min: 2880 },
      { id: 'daniela-2', autor: 'loja', texto: 'Tenho 9h e 11h, qual prefere?', min: 2820 },
      { id: 'daniela-3', autor: 'cliente', texto: '9h eh melhor pra mim', min: 2760 },
      { id: 'daniela-4', autor: 'loja', texto: 'Marcado 9h! Design com henna, 70 💛', min: 2700 },
      { id: 'daniela-5', autor: 'cliente', texto: 'obg flw', min: 2640 },
      { id: 'daniela-6', autor: 'loja', texto: 'Ate amanha Dani 😊', min: 2600 }
    ]
  },
  {
    id: 'roberta',
    nome: 'Roberta Vilela',
    iniciais: 'RV',
    cor: '#e8a3a3',
    naoLidas: 3,
    mensagens: [
      { id: 'roberta-1', autor: 'cliente', texto: 'oi amor, entao eu tinha comprado aquele pacote de massagem modeladora e eu fiz so cinco, sobrou cinco ali guardado, ai eu mudei de bairro e acabei sumindo mas eu to voltando pra regiao agora e queria muito terminar viu, me fala se ainda ta valendo', min: 86400, audio: 52 },
      { id: 'roberta-2', autor: 'loja', texto: 'Roberta que saudade! Vc tem 5 sessoes aqui sim 💛', min: 86340 },
      { id: 'roberta-3', autor: 'cliente', texto: 'aaa que bom', min: 86280 },
      { id: 'roberta-4', autor: 'cliente', texto: 'assim que eu me organizar eu marco', min: 86270 }
    ],
    compromisso: {
      itens: [{ descricao: '5 sessoes restantes do pacote de massagem modeladora', valor: 490 }],
      valorTotal: 490,
      estado: 'travado',
      motivo: 'pacote_parado',
      temperatura: 'frio',
      confianca: 0.33,
      toques: [
        { min: 43200, angulo: 'retomada_pacote', respondeu: false },
        { min: 14400, angulo: 'prova_social', respondeu: false }
      ]
    }
  },
  {
    id: 'ingrid',
    nome: 'Ingrid Salgueiro',
    iniciais: 'IS',
    cor: '#a8d5a2',
    naoLidas: 0,
    mensagens: [
      { id: 'ingrid-1', autor: 'cliente', texto: 'oi! quero fechar o combo de 190', min: 11520 },
      { id: 'ingrid-2', autor: 'loja', texto: 'Boa Ingrid! Terca 16h pode ser?', min: 11460 },
      { id: 'ingrid-3', autor: 'cliente', texto: 'pode sim, ja ta fechado entao', min: 11400 },
      { id: 'ingrid-4', autor: 'loja', texto: 'Fechadissimo! Te espero 😊', min: 11340 }
    ],
    compromisso: {
      itens: [{ descricao: 'Combo limpeza + hidratacao', valor: 190 }],
      valorTotal: 190,
      estado: 'acordado',
      motivo: 'sumico_pos_acordo',
      temperatura: 'morno',
      confianca: 0.66,
      toques: [{ min: 8640, angulo: 'lembrete_simples', respondeu: false }]
    }
  },
  {
    id: 'cristiane',
    nome: 'Cristiane Malta',
    iniciais: 'CM',
    cor: '#dcc2e8',
    naoLidas: 2,
    mensagens: [
      { id: 'cristiane-1', autor: 'cliente', texto: 'oi, vcs fazem pacote fechado de laser pra perna toda?', min: 4320 },
      { id: 'cristiane-2', autor: 'cliente', texto: 'eh so pra ter uma ideia msm', min: 4310 }
    ]
  },
  {
    id: 'eduarda',
    nome: 'Maria Eduarda Rossi',
    iniciais: 'MR',
    cor: '#b9c8d6',
    naoLidas: 4,
    mensagens: [
      { id: 'eduarda-1', autor: 'cliente', texto: 'oii bom dia, entao eu vi que voces fazem peeling de diamante e eu queria saber se da pra fazer junto com a limpeza no mesmo dia ou se precisa esperar, e tambem quanto que ficaria os dois juntinhos pra mim', min: 7200, audio: 36 },
      { id: 'eduarda-2', autor: 'loja', texto: 'Oi Duda! Da pra fazer no mesmo dia sim. Limpeza 140 + peeling 280 = 420', min: 7140 },
      { id: 'eduarda-3', autor: 'cliente', texto: 'nossa 420 pesou um pouco', min: 7080 },
      { id: 'eduarda-4', autor: 'cliente', texto: 'consegue fazer 380?', min: 7070 },
      { id: 'eduarda-5', autor: 'loja', texto: 'Faco 390 no pix, fecha? 🙏', min: 7020 },
      { id: 'eduarda-6', autor: 'cliente', texto: 'deixa eu ver o extrato e te falo hj', min: 6960 }
    ],
    compromisso: {
      itens: [
        { descricao: 'Limpeza de pele profunda', valor: 140 },
        { descricao: 'Peeling de diamante', valor: 280 }
      ],
      valorTotal: 420,
      estado: 'travado',
      motivo: 'preco',
      temperatura: 'morno',
      confianca: 0.58,
      toques: [{ min: 4320, angulo: 'desconto', respondeu: false }]
    }
  },
  {
    id: 'silvana',
    nome: 'Silvana Piccolo',
    iniciais: 'SP',
    cor: '#f0cba0',
    naoLidas: 1,
    mensagens: [
      { id: 'silvana-1', autor: 'cliente', texto: 'oi, henna dura quanto tempo?', min: 1440 },
      { id: 'silvana-2', autor: 'loja', texto: 'Uns 15 a 20 dias na pele, Silvana. Design com henna 70 😊', min: 1380 },
      { id: 'silvana-3', autor: 'cliente', texto: 'blz depois te chamo pra marcar', min: 1320 }
    ],
    compromisso: {
      itens: [{ descricao: 'Design de sobrancelha com henna', valor: 70 }],
      valorTotal: 70,
      estado: 'orcado',
      temperatura: 'morno',
      confianca: 0.47,
      toques: []
    }
  },
  {
    id: 'adriana',
    nome: 'Adriana Peixoto',
    iniciais: 'AP',
    cor: '#9ecfd8',
    naoLidas: 0,
    mensagens: [
      { id: 'adriana-1', autor: 'cliente', texto: 'oi! consigo trocar meu horario de quinta pra sexta?', min: 960 },
      { id: 'adriana-2', autor: 'loja', texto: 'Consegue sim Adri, sexta 14h te serve?', min: 900 },
      { id: 'adriana-3', autor: 'cliente', texto: 'serve perfeito, obg ❤️', min: 840 },
      { id: 'adriana-4', autor: 'loja', texto: 'Trocado! Ate sexta 💛', min: 780 }
    ]
  },
  {
    id: 'flavia',
    nome: 'Flavia Wanderley',
    iniciais: 'FW',
    cor: '#a7c7e7',
    naoLidas: 2,
    mensagens: [
      { id: 'flavia-1', autor: 'cliente', texto: 'oi, voces atendem domingo?', min: 30240 },
      { id: 'flavia-2', autor: 'cliente', texto: 'eh o unico dia que eu tenho', min: 30230 }
    ]
  },
  {
    id: 'isabela',
    nome: 'Isabela Fagundes',
    iniciais: 'IF',
    cor: '#d6c3b0',
    naoLidas: 0,
    mensagens: [
      { id: 'isabela-1', autor: 'cliente', texto: 'oi! fechei a drenagem de segunda com vcs', min: 12960 },
      { id: 'isabela-2', autor: 'loja', texto: 'Isso Isa! 130, segunda 18h 😊', min: 12900 },
      { id: 'isabela-3', autor: 'cliente', texto: 'perfeito', min: 12840 },
      { id: 'isabela-4', autor: 'cliente', texto: 'pago no dia mesmo ne?', min: 12830 },
      { id: 'isabela-5', autor: 'loja', texto: 'Pode ser no dia sim 💛', min: 12780 }
    ],
    compromisso: {
      itens: [{ descricao: 'Drenagem linfatica', valor: 130 }],
      valorTotal: 130,
      estado: 'travado',
      motivo: 'sumico_pos_acordo',
      temperatura: 'morno',
      confianca: 0.63,
      toques: [{ min: 5760, angulo: 'lembrete_simples', respondeu: false }]
    }
  }
]
