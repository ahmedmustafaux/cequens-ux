import * as React from "react"
import { Search, ChevronRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface TriggerCampaignsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  triggerCategories: any[];
}

export function TriggerCampaigns({ formData, setFormData, triggerCategories }: TriggerCampaignsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 h-[450px]">
      {/* Left Column: Categories */}
      <div className="border rounded-md flex flex-col overflow-hidden bg-muted/10">
        <div className="p-3 border-b bg-muted/20 font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Trigger Source
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {triggerCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFormData((prev: any) => ({ ...prev, triggerCategory: cat.id, trigger: "" }))}
              className={cn(
                "w-full flex items-start gap-3 p-3 rounded-md text-left transition-all border",
                formData.triggerCategory === cat.id
                  ? "bg-primary/5 border-primary/50"
                  : "border-transparent hover:bg-primary/5 hover:border-primary/20"
              )}
            >
              <div className={cn(
                "p-2 rounded-md shrink-0 transition-colors",
                formData.triggerCategory === cat.id
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
              )}>
                {cat.icon}
              </div>
              <div>
                <div className="font-medium text-sm">{cat.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{cat.description}</div>
              </div>
              {formData.triggerCategory === cat.id && (
                <ChevronRight className="w-4 h-4 ml-auto text-primary mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Events */}
      <div className="border rounded-md flex flex-col overflow-hidden bg-background">
        <div className="p-3 border-b bg-muted/20 font-medium text-sm text-muted-foreground uppercase tracking-wider">
          Trigger Event
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {!formData.triggerCategory ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 opacity-50" />
              </div>
              <p className="text-sm">Select a trigger source from the left to view available events.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {(triggerCategories.find((c: any) => c.id === formData.triggerCategory)?.triggers || []).map((t: any) => (
                <button
                  key={t.value}
                  onClick={() => setFormData((prev: any) => ({ ...prev, trigger: t.value, triggerConfig: {} }))}
                  className={cn(
                    "w-full flex flex-col gap-3 p-3 rounded-md text-left transition-all border",
                    formData.trigger === t.value
                      ? "bg-primary/5 border-primary/50"
                      : "border-transparent hover:bg-primary/5 hover:border-primary/20"
                  )}
                >
                  <div className="w-full flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {t.label}
                        {formData.trigger === t.value && (
                          <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
                    </div>
                  </div>

                  {/* Trigger Inputs */}
                  {formData.trigger === t.value && t.inputs && (
                    <div className="w-full pt-2 border-t border-primary/10 space-y-3 animate-in fade-in slide-in-from-top-1 cursor-default" onClick={e => e.stopPropagation()}>
                      {t.inputs.map((input: any) => (
                        <div key={input.name} className="space-y-1.5">
                          <Label htmlFor={input.name} className="text-xs font-medium text-muted-foreground">
                            {input.label} {input.required && <span className="text-destructive">*</span>}
                          </Label>
                          {input.type === "select" ? (
                            <Select
                              value={formData.triggerConfig[input.name] || ""}
                              onValueChange={(val) => setFormData((prev: any) => ({
                                ...prev,
                                triggerConfig: { ...prev.triggerConfig, [input.name]: val }
                              }))}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder={input.placeholder || "Select..."} />
                              </SelectTrigger>
                              <SelectContent>
                                {input.options?.map((opt: any) => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              id={input.name}
                              type={input.type}
                              placeholder={input.placeholder}
                              value={formData.triggerConfig[input.name] || ""}
                              onChange={(e) => setFormData((prev: any) => ({
                                ...prev,
                                triggerConfig: { ...prev.triggerConfig, [input.name]: e.target.value }
                              }))}
                              className="h-8 text-xs bg-background"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
