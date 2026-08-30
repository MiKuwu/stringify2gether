import re

with open('src/app/category/[slug]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'<img\s+src=\{post\.media\[0\]\.type === "VIDEO" \? post\.media\[0\]\.url\.replace\([^)]+\) : post\.media\[0\]\.url\}\s+alt=\{post\.title\}\s+className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"\s*/>',
    r'<Image src={post.media[0].type === "VIDEO" ? post.media[0].url.replace(/\\.[^/.]+$/, ".jpg") : post.media[0].url} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />',
    content
)

with open('src/app/category/[slug]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
