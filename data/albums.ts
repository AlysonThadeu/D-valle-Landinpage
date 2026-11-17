export type AlbumCategory = "Casamentos" | "15 anos" | "Eventos";

export type Album = {
  id: string;
  title: string;
  location: string;
  category: AlbumCategory;
  cover: string;
  photos: string[];
};

// Pronto para receber álbuns reais. Os cartões de demonstração ficam sem contagens ou nomes inventados.
export const albums: Album[] = [];

export const albumCategories = ["Todos", "Casamentos", "15 anos", "Eventos"] as const;
