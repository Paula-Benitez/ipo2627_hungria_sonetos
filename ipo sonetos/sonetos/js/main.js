// Composición: único sitio donde se crean y se conectan las piezas del MVC.
import { SonetoModel } from "./models/SonetoModel.js";
import { PreferenciasModel } from "./models/PreferenciasModel.js";
import { SonetoView } from "./views/SonetoView.js";
import { AppController } from "./controllers/AppController.js";

new AppController({
  sonetos: new SonetoModel(),
  preferencias: new PreferenciasModel(),
  vista: new SonetoView(),
  urlDatos: new URL("../data/sonetos.json", import.meta.url),
}).iniciar();
