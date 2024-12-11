
export type ICoordinate = [number, number];
interface IGeometry {
  type: string;
  coordinates: ICoordinate[][];
}
interface IFeature {
  type: string;
  geometry: IGeometry;
}
export interface IBuilding {
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  stories?: IStory[];
  area?: IFeature;
}
export interface IStory {
  id: number;
  name: string;
  sortOrder: number;
  floorplan: string;
}
export interface IData {
  id: number;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  area?: IFeature;
  buildings?: IBuilding[];
}
export const datadummy: IData[] = [
  {
    id: 1,
    name: "Rumah Cilebut",
    location: { lat: -6.52639, lng: 106.7978 },
    area: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.797765, -6.526435],
            [106.797765, -6.5263225],
            [106.797842, -6.52632],
            [106.797842, -6.526435],
            [106.797765, -6.526435],
          ],
        ],
      },
    },
    buildings: [
      {
        name: "Main building",
        location: { lat: -6.52639, lng: 106.7978 },
        area: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [106.797765, -6.526435],
                [106.797765, -6.5263225],
                [106.797842, -6.52632],
                [106.797842, -6.526435],
                [106.797765, -6.526435],
              ],
            ],
          },
        },
        stories: [
          {
            id: 1,
            sortOrder: 1,
            floorplan: "/images/floorplan-rumah-cilebut.png",
            name: "Main Story",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Rumah Kemayoran",
    location: { lat: -6.15608513608899, lng: 106.86234661230317 },
    area: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.86233722457162, -6.15602513439241],
            [106.86226882824174, -6.1561624715990355],
            [106.86232381352654, -6.156198472608495],
            [106.86241098531953, -6.156070469008225],
            [106.86233722457162, -6.15602513439241],
          ],
        ],
      },
    },
    buildings: [
        {
          name: "Main building",
          location: { lat: -6.15608513608899, lng: 106.86234661230317 },
          area: {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                    [106.86233722457162, -6.15602513439241],
                    [106.86226882824174, -6.1561624715990355],
                    [106.86232381352654, -6.156198472608495],
                    [106.86241098531953, -6.156070469008225],
                    [106.86233722457162, -6.15602513439241],
                ],
              ],
            },
          },
          stories: [
            {
              id: 1,
              sortOrder: 1,
              floorplan: "/images/floorplan-rumah-kemayoran.png",
              name: "Main Story",
            },
            {
              id: 2,
              sortOrder: 2,
              floorplan: "/images/floorplan-rumah-kemayoran-2.png",
              name: "2nd Story",
            },
          ],
        },
      ],
  },
  {
    id: 3,
    name: "Rumah Bambu",
    location: { lat: -6.252330834362576, lng: 106.73759426728135 },
    area: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.73757012740022, -6.252205520363003],
            [106.73750441327935, -6.2524268195334285],
            [106.73760633722192, -6.2524454833146],
            [106.73766132250672, -6.252226850407605],
            [106.73757012740022, -6.252205520363003],
          ],
        ],
      },
    },
  },
  {
    id: 4,
    name: "Rumah Gelatik",
    location: { lat: -6.251366326420404, lng: 106.73524470625574 },
    area: {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [106.73507840929682, -6.251241012189732],
            [106.73531846700365, -6.251250344101565],
            [106.73530639706308, -6.251307668699149],
            [106.73542173205072, -6.251319666869932],
            [106.73537077007944, -6.25150363878761],
            [106.73507840929682, -6.2514583123791265],
            [106.73507840929682, -6.251241012189732],
          ],
        ],
      },
    },
    buildings: [
      {
        name: "Main building",
        location: { lat: -6.251366326420404, lng: 106.73524470625574 },
        area: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [106.73508109150583, -6.251245011580532],
                [106.73517094550783, -6.251246344710791],
                [106.7351642399853, -6.251326332520256],
                [106.73508109150583, -6.25133299817049],
                [106.73508109150583, -6.251245011580532],
              ],
            ],
          },
        },
        stories: [
          {
            id: 1,
            sortOrder: 1,
            floorplan: "/images/floorplan-rumah-gelatik.png",
            name: "Main Story",
          },
        ],
      },
    ],
  },
];