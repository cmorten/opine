// @deno-types="https://deno.land/x/types/react/v16.13.1/react.d.ts"
import React from "https://dev.jspm.io/react@16.13.1";
import { fetchDoggos } from "../services/fetchDoggos.ts";

const doggoResource = fetchDoggos();

export const List = () => {
  const doggos = doggoResource.read();

  return (
    <section className="list_section">
      <ol className="list_list">
        {doggos.map((doggo: { id: number; src: string; alt: string }) => (
          <li className="list_tile" key={doggo.id}>
            <a className="list_card" href={doggo.src}>
              <div className="list_image_container">
                <img
                  className="list_image"
                  src={doggo.src}
                  alt={doggo.alt}
                  // @ts-ignore
                  loading="lazy"
                />
              </div>
              <div className="list_description">{`ID: ${doggo.id}`}</div>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
};
