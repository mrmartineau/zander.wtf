interface Props {
  url: string;
}

export function Favicon({ url }: Props) {
  const domain = new URL(url).host.replace('www.', '');

  return (
    <img
      src={`https://icons.duckduckgo.com/ip3/${domain}.ico`}
      width="16"
      height="16"
      class="self-center grow-0 shrink-0"
      loading="lazy"
      alt={`Favicon for ${domain}`}
    />
  );
}
