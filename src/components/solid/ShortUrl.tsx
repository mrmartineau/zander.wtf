interface Props {
  url: string;
}

export function ShortUrl({ url }: Props) {
  const domain = new URL(url).host.replace('www.', '');

  return <>{domain}</>;
}
