import { useState } from "react";
import { promptTemplates, categoryLabels, categoryColors, PromptTemplate } from "@/data/promptTemplates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Bookmark, ChevronLeft } from "lucide-react";

interface TemplateLibraryProps {
  onSelect: (template: PromptTemplate) => void;
  onClose: () => void;
}

export function TemplateLibrary({ onSelect, onClose }: TemplateLibraryProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PromptTemplate['category'] | 'all'>('all');

  const categories = Object.keys(categoryLabels) as PromptTemplate['category'][];

  const filteredTemplates = promptTemplates.filter(template => {
    const matchesSearch = search === "" || 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card/50">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Bookmark className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm">Templates Dark</span>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-border space-y-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
          {search && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => setSearch("")}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <Badge
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer shrink-0 text-xs"
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              variant="outline"
              className={`cursor-pointer shrink-0 text-xs transition-colors ${
                selectedCategory === cat ? categoryColors[cat] : ''
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {categoryLabels[cat]}
            </Badge>
          ))}
        </div>
      </div>

      {/* Templates list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum template encontrado
            </div>
          ) : (
            filteredTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="w-full text-left p-3 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-medium text-sm">{template.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs shrink-0 ${categoryColors[template.category]}`}
                  >
                    {categoryLabels[template.category]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border bg-card/50">
        <p className="text-xs text-muted-foreground text-center">
          {filteredTemplates.length} templates disponíveis
        </p>
      </div>
    </div>
  );
}
