import type { Request, Response } from "express";

import UsuarioAgendaHorarios from "../../models/UsuarioAgendaHorarios";

export default class UsuarioAgendaHorariosController {
    public static async horariosDia(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            id_usuario: "required|integer",
            data: "required|date",
        });
        
        const horariosDia = await UsuarioAgendaHorarios.horariosDiaComAgendamentos(Number(data.id_usuario), data.data);

        return res.json(horariosDia);
    }

     public static async diasComHorariosMes(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            id_usuario: "required|integer",
            data: "required|date",
        });
        
        const diasMes = await UsuarioAgendaHorarios.diasComHorariosMes(Number(data.id_usuario), data.data);

        return res.json(diasMes);
    }

    public static async horarioDisponiveis(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            id_usuario:   "required|integer",
            data:         "required|date",
            ids_servicos: "required|array",
        });

        const horariosDia = await UsuarioAgendaHorarios.horariosDisponiveis(Number(data.id_usuario), data.data, data.ids_servicos as unknown as number[]);

        return res.json(horariosDia);
    }

    public static async diasDisponiveisMes(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            id_usuario: "required|integer",
            data_mes:   "required|date",
            ids_servicos: "required|array",
        });
        
        const diasMes = await UsuarioAgendaHorarios.diasDisponiveisMes(Number(data.id_usuario), data.data_mes, data.ids_servicos as unknown as number[]);
        
        return res.json(diasMes);
    }
}