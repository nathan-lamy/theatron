export default function Footer() {
  return (
    <footer className="flex flex-col text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Made with
        <span className="text-red-500"> ❤ </span>
        by{" "}
        <a
          className="font-medium underline"
          href="https://github.com/nathan-lamy/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Nathan
        </a>{" "}
        for <span className="font-medium">Mister Saly</span>
        {"\n          "}
      </p>
      <a
        className="text-blue-500 hover:underline"
        href="mailto:adrien.saly@ac-nice.fr"
      >
        Un problème ? Contactez-moi !
      </a>
    </footer>
  );
}
