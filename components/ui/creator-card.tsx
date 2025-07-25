import { Eye } from 'lucide-react';
import { FaXTwitter, FaLinkedin, FaYoutube, FaInstagram, FaTiktok } from "react-icons/fa6";
import Image from 'next/image';
import { Badge } from './badge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Card, CardContent } from './card';
import { useRouter } from 'next/navigation';

const platformIconMap = {
  YouTube: { icon: FaYoutube, color: 'text-red-500' },
  Instagram: { icon: FaInstagram, color: 'text-pink-500' },
  TikTok: { icon: FaTiktok, color: 'text-black' },
  Twitter: { icon: FaXTwitter, color: 'text-black' },
  LinkedIn: { icon: FaLinkedin, color: 'text-blue-600' },
};

interface CreatorCardProps {
  thumbnail: string;
  title: string;
  creatorName: string;
  viewCount: number;
  categories: string[];
  platform: keyof typeof platformIconMap;
  postedAt: string; // ISO date string
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'twotoone';
  className?: string;
}

export function CreatorCard({
  thumbnail,
  title,
  creatorName,
  viewCount,
  categories,
  platform,
  postedAt,
  aspectRatio = 'twotoone',
  className = '',
}: CreatorCardProps) {
  const router = useRouter();
  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[16/9]',
    twotoone: 'aspect-[2/1]',
  };

  const PlatformIcon = platformIconMap[platform]?.icon;
  const platformColor = platformIconMap[platform]?.color;

  const handleClick = () => {
    // Create a URL-friendly slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    router.push(`/explore/${slug}`);
  };

  return (
    <Card 
      className={`cursor-pointer group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:shadow-orange-100 transition-all duration-300 border border-gray-200 ${className}`}
      onClick={handleClick}
    >
      {/* Thumbnail Container */}
      <div className={`relative ${aspectRatioClasses[aspectRatio]} w-full overflow-hidden`}>
        <Image
          src={thumbnail}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        {/* Platform Icon Overlay */}
        {PlatformIcon && (
          <div className="absolute top-3 right-3 bg-white backdrop-blur-sm p-1.5 rounded-full flex items-center justify-center shadow">
            <PlatformIcon className={`w-6 h-6 ${platformColor}`} />
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200">
            {title}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatDistanceToNow(parseISO(postedAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{creatorName}</span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>{formatViewCount(viewCount)}</span>
          </div>
        </div>
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200"
            >
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 