import React from "react";
import { renderWithProviders, screen } from "__support__/ui";
import userEvent from "@testing-library/user-event";
import { PLUGIN_COLLECTIONS } from "metabase/plugins";
import CollectionsList from "./CollectionsList";

describe("CollectionsList", () => {
  function setup({ collections = [], openCollections = [], ...props } = {}) {
    renderWithProviders(
      <CollectionsList
        collections={collections}
        openCollections={openCollections}
        filter={() => true}
        handleToggleMobileSidebar={() => false}
        {...props}
      />,
      { withRouter: true, withDND: true },
    );
  }

  function collection({
    id,
    name = "Collection name",
    authority_level = null,
    location = "/",
    children = [],
    archived = false,
  } = {}) {
    return {
      id,
      name,
      authority_level,
      location,
      children,
      archived,
    };
  }

  it("renders a basic collection", () => {
    setup({
      collections: [collection({ id: 1, name: "Collection name" })],
    });

    expect(screen.queryByText("Collection name")).toBeVisible();
  });

  it("opens child collection when user clicks on collection name", () => {
    const onOpen = jest.fn();
    setup({
      collections: [
        collection({
          id: 1,
          name: "Parent collection name",
          children: [
            collection({
              id: 2,
              name: "Child collection name",
              location: "/2/",
            }),
          ],
        }),
      ],
      onOpen,
    });

    userEvent.click(screen.getByText("Parent collection name"));

    expect(onOpen).toHaveBeenCalled();
  });

  describe("Collection types", () => {
    const regularCollection = collection({ id: 1, authority_level: null });
    const officialCollection = collection({
      id: 1,
      authority_level: "official",
    });

    describe("OSS", () => {
      it("displays folder icon for regular collections", () => {
        setup({ collections: [regularCollection] });
        expect(screen.queryByLabelText("folder icon")).toBeInTheDocument();
        expect(screen.queryByLabelText("badge icon")).toBeNull();
      });

      it("displays folder icon for official collections", () => {
        setup({ collections: [officialCollection] });
        expect(screen.queryByLabelText("folder icon")).toBeInTheDocument();
        expect(screen.queryByLabelText("badge icon")).toBeNull();
      });
    });

    describe("EE", () => {
      const ORIGINAL_COLLECTIONS_PLUGIN = {
        ...PLUGIN_COLLECTIONS,
      };

      beforeAll(() => {
        PLUGIN_COLLECTIONS.isRegularCollection = c => !c.authority_level;
        PLUGIN_COLLECTIONS.AUTHORITY_LEVEL = {
          ...ORIGINAL_COLLECTIONS_PLUGIN,
          official: {
            icon: "badge",
          },
        };
      });

      afterAll(() => {
        PLUGIN_COLLECTIONS.isRegularCollection =
          ORIGINAL_COLLECTIONS_PLUGIN.isRegularCollection;
        PLUGIN_COLLECTIONS.AUTHORITY_LEVEL =
          ORIGINAL_COLLECTIONS_PLUGIN.AUTHORITY_LEVEL;
      });

      it("displays folder icon for regular collections", () => {
        setup({ collections: [regularCollection] });
        expect(screen.queryByLabelText("folder icon")).toBeInTheDocument();
        expect(screen.queryByLabelText("badge icon")).toBeNull();
      });

      it("displays badge icon for official collections", () => {
        setup({ collections: [officialCollection] });
        expect(screen.queryByLabelText("folder icon")).toBeNull();
        expect(screen.queryByLabelText("badge icon")).toBeInTheDocument();
      });
    });
  });
});
