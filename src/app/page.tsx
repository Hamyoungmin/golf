import SearchBar from '@/components/SearchBar';
import Notice from '@/components/Notice';

export default function Home() {
  return (
    <div className="container">
      <SearchBar />
      <Notice />
    </div>
  );
}