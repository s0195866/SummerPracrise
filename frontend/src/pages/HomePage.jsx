import CategoryMenu from '../components/CategoryMenu'
import HeroBanner from '../components/HeroBanner'
import Advantages from '../components/Advantages'
import PopularCategories from '../components/PopularCategories'
import PopularProducts from '../components/PopularProducts'
import NewsArticles from '../components/NewsArticles'
import Brands from '../components/Brands'

export default function HomePage() {
  return (
    <>
      <CategoryMenu />
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '0 32px' }}>
        <HeroBanner />
        <Advantages />
        <PopularCategories />
        <PopularProducts />
        <NewsArticles />
        <Brands />
      </main>
    </>
  )
}