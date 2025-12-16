import { createResource } from 'solid-js';

export function CharacterName() {
  const [name] = createResource(() =>
    fetch('https://swapi.dev/api/people/1')
      .then((result) => result.json())
      .then((data) => data.name),
  );

  return (
    <>
      <h2>Name:</h2>
      {/* Luke Skywalker */}
      <div>{name()}</div>
    </>
  );
}
