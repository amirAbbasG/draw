import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { create } from "zustand/react";

import { createSelectors } from "@/stores/zustand/createSelectors";
import { ObjectStoreState } from "@/stores/zustand/object/types";

const objects = [
  {
    id: "4fbb3581-0bc3-4460-9c94-6aaf7fd49e8f",
    type: "group",
    name: "User Object 1",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    userData: {
      isUserCreated: true,
      name: "User Object 1",
      id: "4fbb3581-0bc3-4460-9c94-6aaf7fd49e8f",
      isSerializedFromCode: true,
    },
    children: [
      {
        id: "5a709570-a43b-4939-9f52-ef6626cde7cc",
        type: "mesh",
        name: "Object 5a709570",
        position: [0, 0.5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        userData: {
          id: "5a709570-a43b-4939-9f52-ef6626cde7cc",
          isSerializedFromCode: true,
        },
        geometry: {
          type: "BoxGeometry",
          parameters: {
            objectId: "5a709570-a43b-4939-9f52-ef6626cde7cc",
          },
        },
        material: {
          type: "MeshStandardMaterial",
          color: "ffaa00",
          parameters: {
            objectId: "5a709570-a43b-4939-9f52-ef6626cde7cc",
          },
        },
      },
      {
        id: "51d63b83-f6ff-4eb4-ad3a-f6219d44c9da",
        type: "object",
        name: "Object 51d63b83",
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        userData: {
          id: "51d63b83-f6ff-4eb4-ad3a-f6219d44c9da",
          isSerializedFromCode: true,
        },
      },
      {
        id: "b3eecba2-d78c-4113-a447-7903a675dcc3",
        type: "object",
        name: "Object b3eecba2",
        position: [5, 10, 5],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        userData: {
          id: "b3eecba2-d78c-4113-a447-7903a675dcc3",
          isSerializedFromCode: true,
        },
      },
    ],
  },
];

const initialState: ObjectStoreState = {
  objects: [],
  meshCount: 0,
};

export const useObjectStoreSelector = create<ObjectStoreState>()(
  devtools(
    immer(() => initialState),
    { name: "object", store: "object" },
  ),
);

export const useObjectStore = createSelectors(useObjectStoreSelector);
