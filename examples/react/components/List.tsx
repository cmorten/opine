import React from "https://esm.sh/react@17.0.2?dev";
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
