export default [
    {
        label: 'Agendamento',
        icon: 'calendar_month',
        url: '/agendamento',
    },
    {
        label: 'Atendimento',
        icon: 'medical_services',
        url: '/atendimentos',
    },
    {
        label: 'Prontuário Paciente',
        icon: 'medical_information',
        url: '/prontuarioPaciente',
    },
    {
        label: 'Pacientes',
        icon: 'people',
        url: '/pacientes',
    },
    {
        label: 'Indicadores',
        icon: 'analytics',
        subMenus: [
            {
                icon: 'person',
                label: 'Agendamentos',
                url: '/cadastroUsuarios'
            },
            {
                icon: 'inventory',
                label: 'Atendimentos',
                url: '/atendimentos'
            },
            {
                icon: 'inventory',
                label: 'Faturamento',
                url: '/faturamento'
            }
        ]
    },
    {
        label: 'Gerencial',
        icon: 'settings',
        subMenus: [
            {
                icon: 'language',
                label: 'Cadastros Globais',
                subMenus:[
                    {
                        icon: 'badge',
                        label: 'Usuários',
                        url: '/cadastroUsuarios'
                    },
                    {
                        icon: 'badge',
                        label: 'Prestadores',
                        url: '/cadastroPrestadores'
                    },
                    {
                        icon: 'health_and_safety',
                        label: 'Convênios',
                        url: '/cadastroConvenios'
                    },
                    {
                        icon: 'list_alt',
                        label: 'Procedimentos e Preços',
                        url: '/cadastroProcedimentos'
                    },
                    {
                        icon: 'description',
                        label: 'CIDs',
                        url: '/cadastroCids'
                    }
                ]
            },
            {
                icon: 'calendar_month',
                label: 'Cadastros de Agendamento',
                subMenus:[
                    {
                        icon: 'sym_o_article_shortcut',
                        label: 'Tipos de Consulta',
                        url: '/cadastroTiposConsulta'
                    },
                    {
                        icon: 'sym_o_event_available',
                        label: 'Parâmetros de Agenda',
                        url: '/cadastroParametrosAgenda'
                    }
                ]
            },
        ]
    },
];
