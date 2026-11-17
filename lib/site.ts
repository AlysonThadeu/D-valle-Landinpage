export const site = {
  name: "D'VALLE Assessoria",
  owner: "Talyson Oberto",
  instagramHandle: "dvalleassessoria",
  instagramUrl: "https://www.instagram.com/dvalleassessoria/",
  /** Abre o direct do Instagram diretamente */
  instagramDm: "https://ig.me/m/dvalleassessoria",
  region: "Recife e Região Metropolitana",
  whatsappNumber: "5581973083377",
  whatsappDisplay: "(81) 97308-3377",
};

export function whatsappLink(message = "Olá, D'VALLE! Vim pelo site e gostaria de conversar sobre a assessoria.") {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
