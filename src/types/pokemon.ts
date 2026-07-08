export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;

  sprites: {
    front_default: string;

    other: {
      dream_world: {
        front_default: string;
      };

      ["official-artwork"]: {
        front_default: string;
      };
    };
  };

  types: {
    type: {
      name: string;
    };
  }[];

  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];

  abilities: {
    ability: {
      name: string;
    };
  }[];
}