import type { Request, Response } from "express";

import UsuarioAgendaHorarios from "../../models/UsuarioAgendaHorarios";

export default class UsuarioAgendaHorariosController {
    public static async getAll(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            id_usuario: "required|integer",
        });

        const horarios = await UsuarioAgendaHorarios.query().where("id_usuario", "=", data.id_usuario).get();
        
        return res.json(horarios);
    }

    public static async create(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            horarios: "required|array",
        });

        const horarios = data.horarios as any;

        const idsHorarios = horarios
            .map((horario: any) => horario.id)
            .filter((id: any) => id !== undefined && id !== null);

        await UsuarioAgendaHorarios.query()
            .whereNotIn("id", idsHorarios)
            .delete();

        for (const horarioPayload of horarios) {
            const idHorario = horarioPayload.id;

            if (idHorario) {
                const horarioModel = await UsuarioAgendaHorarios.find(idHorario);

                if (horarioModel) {
                    await horarioModel.update(horarioPayload);
                }
            } else {
                await UsuarioAgendaHorarios.create(horarioPayload);
            }
        }

        return res.send();
    }

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
        });

        const horariosDia = await UsuarioAgendaHorarios.horariosDisponiveis(Number(data.id_usuario), data.data);

        return res.json(horariosDia);
    }

    public static async diasDisponiveisMes(req: Request, res: Response): Promise<any> {
        const data = await req.validate({
            id_usuario: "required|integer",
            data:   "required|date",
        });
        
        const diasMes = await UsuarioAgendaHorarios.diasDisponiveisMes(Number(data.id_usuario), data.data);
        
        return res.json(diasMes);
    }
}