// Estilos de HeroUI como clases, para usarlos en enlaces y componentes del
// servidor (los componentes <Button>, <Card>… de @heroui/react son de cliente).
import { buttonVariants, cardVariants, chipVariants } from "@heroui/styles";

export const btn = buttonVariants;
export const card = cardVariants();
export const chip = (o: Parameters<typeof chipVariants>[0] = {}) => chipVariants(o).base();
