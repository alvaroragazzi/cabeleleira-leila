import Usuarios from "../app/models/Usuarios";

export default {
    default: "user",

    guards: {
        user: {
            model: Usuarios,
        },
    },
}