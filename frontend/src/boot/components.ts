import { boot } from "quasar/wrappers";

export default boot(({ app }) => {
    const files = import.meta.globEager("/src/components/global/**/*.vue");

    Object.entries(files).forEach(([path, module]: any) => {
        const component = module.default;

        if (!component) return;

        let name = component.name;

        if (!name) {
            name = path.split("/").pop().replace(".vue", "");
        }

        app.component(name, component);
    });
});