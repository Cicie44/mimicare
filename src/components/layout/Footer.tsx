export default function Footer() {
  return (
    <footer className="mt-16 border-t border-orange-100 bg-white py-8 text-center text-sm text-gray-400">
      <p className="mb-1">
        Made with 🐾 for Mimi
      </p>
      <p>MimiCare &copy; {new Date().getFullYear()}</p>
    </footer>
  );
}
