export default function Footer() {
  return (
    <footer className="mt-16 border-t border-parchment-300 bg-parchment-50 py-8 text-center text-sm text-gray-400">
      <p className="mb-1">Made with care for Mimi 🐾</p>
      <p>MimiCare &copy; {new Date().getFullYear()}</p>
    </footer>
  );
}
