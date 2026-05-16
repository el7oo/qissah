import Image from 'next/image';

interface AppleEmojiProps {
  name: string;
  className?: string;
  width?: number;
  height?: number;
}

export function AppleEmoji({ name, className = 'w-6 h-6', width = 64, height = 64 }: AppleEmojiProps) {
  // Mapping of common emoji names to their apple emoji hex codes
  const emojiHexMap: Record<string, string> = {
    // Faces
    'grinning': '1f600',
    'smile': '1f604', 
    'laughing': '1f606',
    'joy': '1f602',
    'rofl': '1f923',
    'sweat_smile': '1f605',
    'blush': '1f60a',
    'wink': '1f609',
    'star-struck': '1f929',
    'heart_eyes': '1f60d',
    'kissing_heart': '1f618',
    'yum': '1f60b',
    'cool': '1f60e',
    'upside_down': '1f643',
    'melting': '1fae0',
    'saluting': '1fae1',
    'zany': '1f92a',
    'shushing': '1f92b',
    'thinking': '1f914',
    'zipper_mouth': '1f910',
    'exploding_head': '1f92f',
    'sunglasses': '1f60e',
    
    // Gestures
    'thumbsup': '1f44d',
    'clap': '1f44f',
    'wave': '1f44b',
    'handshake': '1f91d',
    'pray': '1f64f',
    'muscle': '1f4aa',
    
    // Symbols
    'fire': '1f525',
    'sparkles': '2728',
    'star': '2b50',
    'heart': '2764-fe0f',
    '🤍': '1f90d',
    '🖤': '1f5a4',
    '100': '1f4af',
    'check': '2705',
    'cross': '274c',
    'warning': '26a0-fe0f',
    'info': '2139-fe0f',
    
    // Commerce / Shop
    'shopping_bags': '1f6cd-fe0f',
    'cart': '1f6d2',
    'credit_card': '1f4b3',
    'money_bag': '1f4b0',
    'truck': '1f69a',
    'package': '1f4e6',
    'lock': '1f512',
    'tag': '1f3f7-fe0f',
    'gem': '1f48e',
    'crown': '1f451',
    'headphone': '1f3a7',
    
    // Navigation
    'home': '1f3e0',
    'user': '1f464',
    'gear': '2699-fe0f',
    'search': '1f50d',
    
    // Objects
    'iphone': '1f4f1',
    'watch': '231a',
    'laptop': '1f4bb',
  };

  let hex = '';
  
  if (emojiHexMap[name.toLowerCase()]) {
    hex = emojiHexMap[name.toLowerCase()];
  } else if (/^[0-9a-f-]+$/.test(name)) {
    hex = name;
  } else {
    // Automatically convert actual emoji characters to their hex representation
    hex = Array.from(name)
      .map((char) => char.codePointAt(0)?.toString(16))
      .filter(Boolean)
      .join('-');
  }

  if (!hex) {
    console.warn(`AppleEmoji: No mapping found for "${name}"`);
    return null;
  }

  // Workaround for some emojis that don't need the -fe0f variation in emoji-datasource
  // Usually, the CDN works directly with the generated hex, but if an image is missing, 
  // one might need to strip '-fe0f' or append it. The standard is pretty reliable though.
  const url = `https://cdnjs.cloudflare.com/ajax/libs/emoji-datasource-apple/15.0.1/img/apple/64/${hex}.png`;

  return (
    <Image 
      src={url} 
      alt={name} 
      width={width} 
      height={height} 
      className={`inline-block object-contain ${className}`}
      unoptimized 
    />
  );
}
