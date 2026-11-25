import fs from 'node:fs';
import path from 'node:path';

const remainingProductsConfig = [
  // --- EARRINGS (10) ---
  {
    id: 'prod-enquiry-earring-01',
    name: 'Silver Blue Sapphire Crystal Stud Earrings',
    slug: 'silver-blue-sapphire-crystal-stud-earrings',
    sku: 'GURU-ENQ-EAR-001',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Blue Sapphire Crystal Stud Earrings',
    destDir: 'public/products/Earrings/stud-blue-sapphire-crystal',
    urlBase: '/products/Earrings/stud-blue-sapphire-crystal',
    description: 'Brilliant royal-blue sapphire-hue crystal studs set in handcrafted 925 sterling silver prongs.'
  },
  {
    id: 'prod-enquiry-earring-02',
    name: 'Silver Classic Ruby Stud Earrings',
    slug: 'silver-classic-ruby-stud-earrings',
    sku: 'GURU-ENQ-EAR-002',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Classic Ruby Stud Earrings',
    destDir: 'public/products/Earrings/stud-classic-ruby',
    urlBase: '/products/Earrings/stud-classic-ruby',
    description: 'Deep crimson-red solitaire ruby stud earrings in a classic 4-prong solid silver mount.'
  },
  {
    id: 'prod-enquiry-earring-03',
    name: 'Silver Classic Solitaire AD Stud Earrings',
    slug: 'silver-classic-solitaire-ad-stud-earrings',
    sku: 'GURU-ENQ-EAR-003',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Classic Solitaire AD Stud Earrings',
    destDir: 'public/products/Earrings/stud-classic-solitaire-ad',
    urlBase: '/products/Earrings/stud-classic-solitaire-ad',
    description: 'Round brilliant-cut American Diamond solitaire studs mounted in a high-polish 925 silver basket.'
  },
  {
    id: 'prod-enquiry-earring-04',
    name: 'Silver Cream Coral Flower Stud Earrings',
    slug: 'silver-cream-coral-flower-stud-earrings',
    sku: 'GURU-ENQ-EAR-004',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Cream Coral Flower Stud Earrings',
    destDir: 'public/products/Earrings/stud-cream-coral-flower',
    urlBase: '/products/Earrings/stud-cream-coral-flower',
    description: 'Carved natural cream coral floral stud earrings adorned with silver petal accents.'
  },
  {
    id: 'prod-enquiry-earring-05',
    name: 'Silver Natural Rose Quartz Stud Earrings',
    slug: 'silver-natural-rose-quartz-stud-earrings',
    sku: 'GURU-ENQ-EAR-005',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Natural Rose Quartz Stud Earrings',
    destDir: 'public/products/Earrings/stud-natural-rose-quartz',
    urlBase: '/products/Earrings/stud-natural-rose-quartz',
    description: 'Soft translucent pink natural rose quartz cabochon studs encased in a delicate silver bezel.'
  },
  {
    id: 'prod-enquiry-earring-06',
    name: 'Silver Princess Square AD Stud Earrings',
    slug: 'silver-princess-square-ad-stud-earrings',
    sku: 'GURU-ENQ-EAR-006',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Princess Square AD Stud Earrings',
    destDir: 'public/products/Earrings/stud-princess-square-ad',
    urlBase: '/products/Earrings/stud-princess-square-ad',
    description: 'Square princess-cut American Diamond studs in a 4-prong geometric sterling silver setting.'
  },
  {
    id: 'prod-enquiry-earring-07',
    name: 'Silver Pristine Pearl Stud Earrings',
    slug: 'silver-pristine-pearl-stud-earrings',
    sku: 'GURU-ENQ-EAR-007',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Pristine Pearl Stud Earrings',
    destDir: 'public/products/Earrings/stud-pristine-pearl',
    urlBase: '/products/Earrings/stud-pristine-pearl',
    description: 'Classic spherical white freshwater pearl studs resting on solid 925 sterling silver posts.'
  },
  {
    id: 'prod-enquiry-earring-08',
    name: 'Silver Radiant Emerald Stud Earrings',
    slug: 'silver-radiant-emerald-stud-earrings',
    sku: 'GURU-ENQ-EAR-008',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Radiant Emerald Stud Earrings',
    destDir: 'public/products/Earrings/stud-radiant-emerald',
    urlBase: '/products/Earrings/stud-radiant-emerald',
    description: 'Vibrant green radiant-cut emerald solitaire studs secured in a raised silver collet setting.'
  },
  {
    id: 'prod-enquiry-earring-09',
    name: 'Silver Red Coral Flower Stud Earrings',
    slug: 'silver-red-coral-flower-stud-earrings',
    sku: 'GURU-ENQ-EAR-009',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Red Coral Flower Stud Earrings',
    destDir: 'public/products/Earrings/stud-red-coral-flower',
    urlBase: '/products/Earrings/stud-red-coral-flower',
    description: 'Vivid red carved coral blossom studs centered in textured sterling silver floral petals.'
  },
  {
    id: 'prod-enquiry-earring-10',
    name: 'Silver Round Brilliant AD Stud Earrings',
    slug: 'silver-round-brilliant-ad-stud-earrings',
    sku: 'GURU-ENQ-EAR-010',
    category: 'Earrings',
    srcDir: 'Products/Earrings/Silver Round Brilliant AD Stud Earrings',
    destDir: 'public/products/Earrings/stud-round-brilliant-ad',
    urlBase: '/products/Earrings/stud-round-brilliant-ad',
    description: 'Micro-pavé halo round brilliant American Diamond studs handcrafted in 925 sterling silver.'
  },

  // --- GOD SMALL STATUES (9) ---
  {
    id: 'prod-enquiry-statue-01',
    name: 'Carved Sphatika Kurma Turtle Idol',
    slug: 'carved-sphatika-kurma-turtle-idol',
    sku: 'GURU-ENQ-STA-001',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Carved Sphatika Kurma Turtle Idol',
    destDir: 'public/products/God Small Statues/sphatika-carved-turtle-idol',
    urlBase: '/products/God Small Statues/sphatika-carved-turtle-idol',
    description: 'Detailed crystal-cut Sphatika (Quartz) Kurma avatar turtle figurine resting on an auspicious lotus base for Vastu prosperity.'
  },
  {
    id: 'prod-enquiry-statue-02',
    name: 'Mini Sphatika Shiva Lingam',
    slug: 'mini-sphatika-shiva-lingam',
    sku: 'GURU-ENQ-STA-002',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Mini Sphatika Shiva Lingam',
    destDir: 'public/products/God Small Statues/sphatika-mini-shiva-lingam',
    urlBase: '/products/God Small Statues/sphatika-mini-shiva-lingam',
    description: 'Petite 100% natural clear Sphatika quartz Shiva Lingam suitable for home altar meditation and personal pooja.'
  },
  {
    id: 'prod-enquiry-statue-03',
    name: 'Natural Large White Shankha Shell',
    slug: 'natural-large-white-shankha-shell',
    sku: 'GURU-ENQ-STA-003',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Natural Large White Shankha Shell',
    destDir: 'public/products/God Small Statues/natural-white-shankha-large',
    urlBase: '/products/God Small Statues/natural-white-shankha-large',
    description: 'Sacred large natural non-blowable Vamavarti white Shankha (Conch shell) for pooja altar Abhishek and divine blessings.'
  },
  {
    id: 'prod-enquiry-statue-04',
    name: 'Natural Sacred Vamavarti Shankha 1',
    slug: 'natural-sacred-vamavarti-shankha-1',
    sku: 'GURU-ENQ-STA-004',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Natural Sacred Vamavarti Shankha 1',
    destDir: 'public/products/God Small Statues/natural-sacred-shankha-1',
    urlBase: '/products/God Small Statues/natural-sacred-shankha-1',
    description: 'Auspicious white natural pooja Shankha with traditional vermilion sacred temple markings.'
  },
  {
    id: 'prod-enquiry-statue-05',
    name: 'Natural Sacred Vamavarti Shankha 2',
    slug: 'natural-sacred-vamavarti-shankha-2',
    sku: 'GURU-ENQ-STA-005',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Natural Sacred Vamavarti Shankha 2',
    destDir: 'public/products/God Small Statues/natural-sacred-shankha-2',
    urlBase: '/products/God Small Statues/natural-sacred-shankha-2',
    description: 'Smooth polished sacred natural Shankha shell for home deity sanctum and daily spiritual rituals.'
  },
  {
    id: 'prod-enquiry-statue-06',
    name: 'Natural Sphatika Kurma Turtle Idol',
    slug: 'natural-sphatika-kurma-turtle-idol',
    sku: 'GURU-ENQ-STA-006',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Natural Sphatika Kurma Turtle Idol',
    destDir: 'public/products/God Small Statues/sphatika-kurma-turtle-idol',
    urlBase: '/products/God Small Statues/sphatika-kurma-turtle-idol',
    description: 'Pure natural Sphatika (Quartz) crystal Kurma turtle idol carved for Vastu energy and positive cosmic vibrations.'
  },
  {
    id: 'prod-enquiry-statue-07',
    name: 'Natural Sphatika Shiva Lingam',
    slug: 'natural-sphatika-shiva-lingam',
    sku: 'GURU-ENQ-STA-007',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Natural Sphatika Shiva Lingam',
    destDir: 'public/products/God Small Statues/sphatika-shiva-lingam',
    urlBase: '/products/God Small Statues/sphatika-shiva-lingam',
    description: 'Master-crafted natural crystal Sphatika sacred Shiva Lingam with integral Yoni base for divine peace and harmony.'
  },
  {
    id: 'prod-enquiry-statue-08',
    name: 'Rare Natural Black Divine Shankha',
    slug: 'rare-natural-black-divine-shankha',
    sku: 'GURU-ENQ-STA-008',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Rare Natural Black Divine Shankha',
    destDir: 'public/products/God Small Statues/natural-black-divine-shankha',
    urlBase: '/products/God Small Statues/natural-black-divine-shankha',
    description: 'Rare natural dark/black Vamavarti Shankha shell traditionally consecrated for protection against negative energies.'
  },
  {
    id: 'prod-enquiry-statue-09',
    name: 'Sacred Gandaki River Shaligram Shila',
    slug: 'sacred-gandaki-river-shaligram-shila',
    sku: 'GURU-ENQ-STA-009',
    category: 'God Small Statues',
    srcDir: 'Products/God Small Statues/Sacred Gandaki River Shaligram Shila',
    destDir: 'public/products/God Small Statues/sacred-shaligram-shila',
    urlBase: '/products/God Small Statues/sacred-shaligram-shila',
    description: 'Authentic sacred natural black Shaligram stone reverently sourced from Nepal\'s sacred Kali Gandaki river, embodying Lord Vishnu.'
  },

  // --- NECK JEWELLERY (6) ---
  {
    id: 'prod-enquiry-neck-01',
    name: 'Gold-Plated Silver Ruby Necklace',
    slug: 'gold-plated-silver-ruby-necklace',
    sku: 'GURU-ENQ-NCK-001',
    category: 'Neck Jewellery',
    srcDir: 'Products/Neck Jewellery/Gold-Plated Silver Ruby Necklace',
    destDir: 'public/products/Neck Jewellery/gold-plated-silver-ruby-necklace',
    urlBase: '/products/Neck Jewellery/gold-plated-silver-ruby-necklace',
    description: 'Heritage 22K yellow gold-plated 925 sterling silver choker necklace studded with radiant ruby gemstones.'
  },
  {
    id: 'prod-enquiry-neck-02',
    name: 'Light Green Onyx 3-Layered Mala',
    slug: 'light-green-onyx-3-layered-mala',
    sku: 'GURU-ENQ-NCK-002',
    category: 'Neck Jewellery',
    srcDir: 'Products/Neck Jewellery/Light Green Onyx 3-Layered Mala',
    destDir: 'public/products/Neck Jewellery/light-green-onyx-3layer-mala',
    urlBase: '/products/Neck Jewellery/light-green-onyx-3layer-mala',
    description: 'Regal 3-strand faceted light green natural onyx beaded necklace finished with a sterling silver lock.'
  },
  {
    id: 'prod-enquiry-neck-03',
    name: 'Natural Green Onyx Beaded Mala',
    slug: 'natural-green-onyx-beaded-mala',
    sku: 'GURU-ENQ-NCK-003',
    category: 'Neck Jewellery',
    srcDir: 'Products/Neck Jewellery/Natural Green Onyx Beaded Mala',
    destDir: 'public/products/Neck Jewellery/natural-green-onyx-beaded-mala',
    urlBase: '/products/Neck Jewellery/natural-green-onyx-beaded-mala',
    description: 'Deep forest-green natural onyx round gemstone beads strung in a traditional devotional garland mala.'
  },
  {
    id: 'prod-enquiry-neck-04',
    name: 'Natural Red Spinel Oval Beads Haar',
    slug: 'natural-red-spinel-oval-beads-haar',
    sku: 'GURU-ENQ-NCK-004',
    category: 'Neck Jewellery',
    srcDir: 'Products/Neck Jewellery/Natural Red Spinel Oval Beads Haar',
    destDir: 'public/products/Neck Jewellery/natural-red-spinel-oval-haar',
    urlBase: '/products/Neck Jewellery/natural-red-spinel-oval-haar',
    description: 'Celebratory long festive haar necklace featuring polished oval natural red spinel beads.'
  },
  {
    id: 'prod-enquiry-neck-05',
    name: 'Silver Coral and Pearl Long Necklace',
    slug: 'silver-coral-and-pearl-long-necklace',
    sku: 'GURU-ENQ-NCK-005',
    category: 'Neck Jewellery',
    srcDir: 'Products/Neck Jewellery/Silver Coral and Pearl Long Necklace',
    destDir: 'public/products/Neck Jewellery/silver-coral-pearl-long-necklace',
    urlBase: '/products/Neck Jewellery/silver-coral-pearl-long-necklace',
    description: 'Graceful multi-gem long necklace harmoniously alternating vibrant red coral beads and lustrous freshwater pearls.'
  },
  {
    id: 'prod-enquiry-neck-06',
    name: 'Traditional Ruby Long Haar Necklace',
    slug: 'traditional-ruby-long-haar-necklace',
    sku: 'GURU-ENQ-NCK-006',
    category: 'Neck Jewellery',
    srcDir: 'Products/Neck Jewellery/Traditional Ruby Long Haar Necklace',
    destDir: 'public/products/Neck Jewellery/traditional-ruby-long-haar',
    urlBase: '/products/Neck Jewellery/traditional-ruby-long-haar',
    description: 'Heritage South Indian style multi-strand ruby beaded long haar necklace crafted for bridal and grand festive attire.'
  },

  // --- PENDANTS (13) ---
  {
    id: 'prod-enquiry-pendant-01',
    name: 'Antique Peacock Motif Silver Pendant',
    slug: 'antique-peacock-motif-silver-pendant',
    sku: 'GURU-ENQ-PND-001',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Antique Peacock Motif Silver Pendant',
    destDir: 'public/products/Pendants/antique-peacock-motif-pendant',
    urlBase: '/products/Pendants/antique-peacock-motif-pendant',
    description: 'Handcrafted oxidized antique 925 silver pendant featuring a sacred royal peacock (Mayura) motif with feathered plumage.'
  },
  {
    id: 'prod-enquiry-pendant-02',
    name: 'Bottle Green Stone Ganesha Pendant',
    slug: 'bottle-green-stone-ganesha-pendant',
    sku: 'GURU-ENQ-PND-002',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Bottle Green Stone Ganesha Pendant',
    destDir: 'public/products/Pendants/bottle-green-ganesha-pendant',
    urlBase: '/products/Pendants/bottle-green-ganesha-pendant',
    description: 'Lord Ganesha intricately carved in a deep bottle-green stone encased in a solid sterling silver frame.'
  },
  {
    id: 'prod-enquiry-pendant-03',
    name: 'Evil Eye Protective Black Agate Pendant',
    slug: 'evil-eye-protective-black-agate-pendant',
    sku: 'GURU-ENQ-PND-003',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Evil Eye Protective Black Agate Pendant',
    destDir: 'public/products/Pendants/evil-eye-black-agate-pendant',
    urlBase: '/products/Pendants/evil-eye-black-agate-pendant',
    description: 'Protective Drishti oval pendant featuring polished natural black agate within a handcrafted silver border.'
  },
  {
    id: 'prod-enquiry-pendant-04',
    name: 'Goddess Chamundeshwari Silver Pendant',
    slug: 'goddess-chamundeshwari-silver-pendant',
    sku: 'GURU-ENQ-PND-004',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Goddess Chamundeshwari Silver Pendant',
    destDir: 'public/products/Pendants/goddess-chamundeshwari-pendant',
    urlBase: '/products/Pendants/goddess-chamundeshwari-pendant',
    description: 'Auspicious Goddess Chamundeshwari Devi seated posture deity medallion embossed in pure 925 sterling silver.'
  },
  {
    id: 'prod-enquiry-pendant-05',
    name: 'Guru Sri Raghavendra Swamy Silver Pendant',
    slug: 'guru-sri-raghavendra-swamy-silver-pendant',
    sku: 'GURU-ENQ-PND-005',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Guru Sri Raghavendra Swamy Silver Pendant',
    destDir: 'public/products/Pendants/raghavendra-swamy-silver-pendant',
    urlBase: '/products/Pendants/raghavendra-swamy-silver-pendant',
    description: 'Sacred Brindavana medallion pendant of Guru Sri Raghavendra Swamy of Mantralayam in pure solid silver.'
  },
  {
    id: 'prod-enquiry-pendant-06',
    name: 'Lord Ayyappa Embossed Silver Pendant',
    slug: 'lord-ayyappa-embossed-silver-pendant',
    sku: 'GURU-ENQ-PND-006',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Lord Ayyappa Embossed Silver Pendant',
    destDir: 'public/products/Pendants/lord-ayyappa-embossed-pendant',
    urlBase: '/products/Pendants/lord-ayyappa-embossed-pendant',
    description: 'Divine Lord Ayyappa Swamy devotional medallion with raised relief posture crafted in sterling silver.'
  },
  {
    id: 'prod-enquiry-pendant-07',
    name: 'Natural Firoza Turquoise Silver Pendant',
    slug: 'natural-firoza-turquoise-silver-pendant',
    sku: 'GURU-ENQ-PND-007',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Natural Firoza Turquoise Silver Pendant',
    destDir: 'public/products/Pendants/natural-firoza-turquoise-pendant',
    urlBase: '/products/Pendants/natural-firoza-turquoise-pendant',
    description: 'Natural sky-blue Persian Firoza (Turquoise) cabochon stone mounted in intricate rope-twist silver filigree.'
  },
  {
    id: 'prod-enquiry-pendant-08',
    name: 'Natural White Agate Silver Pendant',
    slug: 'natural-white-agate-silver-pendant',
    sku: 'GURU-ENQ-PND-008',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Natural White Agate Silver Pendant',
    destDir: 'public/products/Pendants/natural-white-agate-pendant',
    urlBase: '/products/Pendants/natural-white-agate-pendant',
    description: 'Smooth soothing natural white agate healing gemstone pendant mounted with a durable silver bail.'
  },
  {
    id: 'prod-enquiry-pendant-09',
    name: 'Ruby Lord Ayyappa Swamy Silver Pendant',
    slug: 'ruby-lord-ayyappa-swamy-silver-pendant',
    sku: 'GURU-ENQ-PND-009',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Ruby Lord Ayyappa Swamy Silver Pendant',
    destDir: 'public/products/Pendants/ruby-lord-ayyappa-pendant',
    urlBase: '/products/Pendants/ruby-lord-ayyappa-pendant',
    description: 'Lord Ayyappa Swamy silver medallion encircled by radiant ruby gemstone accents for divine protection.'
  },
  {
    id: 'prod-enquiry-pendant-10',
    name: 'Sacred Naga Divine Silver Pendant',
    slug: 'sacred-naga-divine-silver-pendant',
    sku: 'GURU-ENQ-PND-010',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Sacred Naga Divine Silver Pendant',
    destDir: 'public/products/Pendants/sacred-naga-divine-pendant',
    urlBase: '/products/Pendants/sacred-naga-divine-pendant',
    description: 'Sacred multi-hooded Naga Devata (Serpent deity) divine silver pendant traditionally revered for astrological harmony.'
  },
  {
    id: 'prod-enquiry-pendant-11',
    name: 'Sacred Om Ganapati Silver Pendant',
    slug: 'sacred-om-ganapati-silver-pendant',
    sku: 'GURU-ENQ-PND-011',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Sacred Om Ganapati Silver Pendant',
    destDir: 'public/products/Pendants/sacred-om-ganapati-pendant',
    urlBase: '/products/Pendants/sacred-om-ganapati-pendant',
    description: 'Auspicious sacred Om calligraphic design seamlessly blending Lord Ganesha\'s trunk in gleaming 925 silver.'
  },
  {
    id: 'prod-enquiry-pendant-12',
    name: 'Surya Bhagwan Sunburst Silver Pendant',
    slug: 'surya-bhagwan-sunburst-silver-pendant',
    sku: 'GURU-ENQ-PND-012',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Surya Bhagwan Sunburst Silver Pendant',
    destDir: 'public/products/Pendants/surya-sunburst-silver-pendant',
    urlBase: '/products/Pendants/surya-sunburst-silver-pendant',
    description: 'Radiant Surya Deva (Sun God) face pendant surrounded by polished flaming sunburst rays in sterling silver.'
  },
  {
    id: 'prod-enquiry-pendant-13',
    name: 'Synthetic Red Ruby Ganesha Pendant',
    slug: 'synthetic-red-ruby-ganesha-pendant',
    sku: 'GURU-ENQ-PND-013',
    category: 'Pendants',
    srcDir: 'Products/Pendants/Synthetic Red Ruby Ganesha Pendant',
    destDir: 'public/products/Pendants/synthetic-red-ruby-ganesha-pendant',
    urlBase: '/products/Pendants/synthetic-red-ruby-ganesha-pendant',
    description: 'Lord Ganesha devotional pendant sculpted with a teardrop faceted synthetic red ruby gemstone body in silver casing.'
  },

  // --- RINGS (6) ---
  {
    id: 'prod-enquiry-ring-01',
    name: 'Silver Square Crest Turtle AD Ring',
    slug: 'silver-square-crest-turtle-ad-ring',
    sku: 'GURU-ENQ-RNG-001',
    category: 'Rings',
    srcDir: 'Products/Rings/Silver Square Crest Turtle AD Ring',
    destDir: 'public/products/Rings/silver-square-crest-turtle-ad',
    urlBase: '/products/Rings/silver-square-crest-turtle-ad',
    description: 'Vastu Kurma (turtle) motif resting on an elevated square crest micro-pavé set with sparkling American Diamonds.'
  },
  {
    id: 'prod-enquiry-ring-02',
    name: 'Silver Dual-Tone Kurma Turtle Ring',
    slug: 'silver-dual-tone-kurma-turtle-ring',
    sku: 'GURU-ENQ-RNG-002',
    category: 'Rings',
    srcDir: 'Products/Rings/Silver Dual-Tone Kurma Turtle Ring',
    destDir: 'public/products/Rings/silver-dual-tone-kurma-turtle',
    urlBase: '/products/Rings/silver-dual-tone-kurma-turtle',
    description: 'Dual-tone gold and sterling silver finish Kurma turtle ring with finely embossed shell engravings.'
  },
  {
    id: 'prod-enquiry-ring-03',
    name: 'Silver Floral Filigree Band Ring',
    slug: 'silver-floral-filigree-band-ring',
    sku: 'GURU-ENQ-RNG-003',
    category: 'Rings',
    srcDir: 'Products/Rings/Silver Floral Filigree Band Ring',
    destDir: 'public/products/Rings/silver-floral-filigree-band',
    urlBase: '/products/Rings/silver-floral-filigree-band',
    description: 'Wide contemporary designer band showcasing intricate floral cutout silver filigree scrollwork.'
  },
  {
    id: 'prod-enquiry-ring-04',
    name: 'Silver Kurma Turtle White AD Ring',
    slug: 'silver-kurma-turtle-white-ad-ring',
    sku: 'GURU-ENQ-RNG-004',
    category: 'Rings',
    srcDir: 'Products/Rings/Silver Kurma Turtle White AD Ring',
    destDir: 'public/products/Rings/silver-kurma-turtle-white-ad',
    urlBase: '/products/Rings/silver-kurma-turtle-white-ad',
    description: 'Classic silver Kurma ring with brilliant white cubic zirconia stones encrusted across the domed shell.'
  },
  {
    id: 'prod-enquiry-ring-05',
    name: 'Silver Turtle Blue Sapphire Ring',
    slug: 'silver-turtle-blue-sapphire-ring',
    sku: 'GURU-ENQ-RNG-005',
    category: 'Rings',
    srcDir: 'Products/Rings/Silver Turtle Blue Sapphire Ring',
    destDir: 'public/products/Rings/silver-turtle-blue-sapphire',
    urlBase: '/products/Rings/silver-turtle-blue-sapphire',
    description: 'Kurma turtle ring featuring a vibrant oval royal-blue synthetic sapphire centerpiece on the shell.'
  },
  {
    id: 'prod-enquiry-ring-06',
    name: 'Unisex Natural Navaratna Silver Ring 1ct',
    slug: 'unisex-natural-navaratna-silver-ring-1ct',
    sku: 'GURU-ENQ-RNG-006',
    category: 'Rings',
    srcDir: 'Products/Rings/Unisex Natural Navaratna Silver Ring 1ct',
    destDir: 'public/products/Rings/unisex-natural-navaratna-1ct',
    urlBase: '/products/Rings/unisex-natural-navaratna-1ct',
    description: 'Square-profile unisex silver ring mounted with the 9 sacred Vedic planetary gemstones (1.00 ct total gem weight).'
  }
];

const generatedProducts = [];

for (const p of remainingProductsConfig) {
  const srcPath = path.resolve(p.srcDir);
  const destPath = path.resolve(p.destDir);
  fs.mkdirSync(destPath, { recursive: true });

  const files = fs.readdirSync(srcPath);
  const copiedUrls = [];

  // Check if numbered 1.png, 2.png, 3.png exist
  const has1 = files.includes('1.png');
  const has2 = files.includes('2.png');
  const has3 = files.includes('3.png');

  if (has1) {
    fs.copyFileSync(path.join(srcPath, '1.png'), path.join(destPath, 'image_1.png'));
    copiedUrls.push(`${p.urlBase}/image_1.png`);
    if (has2) {
      fs.copyFileSync(path.join(srcPath, '2.png'), path.join(destPath, 'image_2.png'));
      copiedUrls.push(`${p.urlBase}/image_2.png`);
    }
    if (has3) {
      fs.copyFileSync(path.join(srcPath, '3.png'), path.join(destPath, 'image_3.png'));
      copiedUrls.push(`${p.urlBase}/image_3.png`);
    }
  } else {
    // Other image filenames (e.g. ChatGPT image...)
    const pngs = files.filter(f => f.endsWith('.png'));
    pngs.forEach((pngFile, idx) => {
      const outName = `image_${idx + 1}.png`;
      fs.copyFileSync(path.join(srcPath, pngFile), path.join(destPath, outName));
      copiedUrls.push(`${p.urlBase}/${outName}`);
    });
  }

  generatedProducts.push({
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    subcategory: p.category,
    shortDescription: p.description,
    description: `${p.description} Available on bespoke order or enquiry. Please contact our master artisans directly for immediate pricing, exact silver weight, hallmarking certification, and custom sizing.`,
    tags: ['silver', p.category.toLowerCase(), 'bespoke', 'enquiry'],
    gender: 'Unisex',
    occasion: ['Daily wear', 'Occasional', 'Devotional', 'Gifting'],
    images: copiedUrls,
    metalType: 'SILVER',
    metalPurity: '925',
    metalColor: 'White',
    grossWeightGrams: 0,
    netWeightGrams: 0,
    gemstones: [],
    hallmarked: true,
    certified: true,
    pricingMode: 'ENQUIRY',
    fixedPrice: null,
    makingChargeType: 'FIXED',
    makingChargeValue: 0,
    wastagePercentage: 0,
    certificationCharge: 0,
    packagingCharge: 0,
    gstPercentage: 3,
    totalStock: 10,
    hasVariants: false,
    variantAttributes: [],
    variants: [],
    lowStockThreshold: 0,
    readyToShip: false,
    dispatchDays: 5,
    returnEligible: false,
    returnPolicyDays: 0,
    codAvailable: false,
    badges: ['CALL_TO_ORDER'],
    rating: 5,
    reviewCount: 0,
    status: 'ACTIVE',
    enabled: true,
    createdAt: '2026-11-25T00:00:00.000Z',
    updatedAt: '2026-11-25T00:00:00.000Z',
    seoTitle: `${p.name} | Guru Diamonds`,
    seoDescription: p.description,
  });
}

const fileContent = `import type { Product } from '../types';

/**
 * 44 Authentic Catalogue Items available on direct Call / Enquiry
 * Strictly separate from supplier batch drafts to maintain test integrity.
 */
export const ENQUIRY_PRODUCTS: Product[] = ${JSON.stringify(generatedProducts, null, 2)};
`;

fs.writeFileSync(path.resolve('src/data/enquiryProducts.ts'), fileContent, 'utf8');
console.log(`Successfully synced ${generatedProducts.length} enquiry products and wrote src/data/enquiryProducts.ts!`);
