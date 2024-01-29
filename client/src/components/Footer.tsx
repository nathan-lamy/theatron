export default function Footer() {
  return (
    <footer className="flex flex-col text-center">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Made with
        <span className="text-red-500"> ❤ </span>
        by Nathan for Mister Saly{"\n          "}
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
