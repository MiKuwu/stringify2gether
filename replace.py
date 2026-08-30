import re

with open('src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace banner img
content = re.sub(
    r'<img src={settings.logoUrl}.*?/>',
    r'<Image src={settings.logoUrl} alt="Logo" width={400} height={128} className="h-24 md:h-32 mb-4 object-contain max-w-full" />',
    content
)

# Replace post media
content = re.sub(
    r'<img\s+src=\{post\.media\[0\]\.type === "VIDEO" \? post\.media\[0\]\.url\.replace\([^)]+\) : post\.media\[0\]\.url\}\s+alt=\{post\.title\}\s+loading="lazy"\s+decoding="async"\s+className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"\s*/>',
    r'<Image src={post.media[0].type === "VIDEO" ? post.media[0].url.replace(/\\.[^/.]+$/, ".jpg") : post.media[0].url} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />',
    content
)

with open('src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
