import React from "react";
import { cn } from "@/lib/ui-system";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

// Enhanced form field with validation states
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField = ({
  label,
  description,
  error,
  success,
  warning,
  info,
  required,
  children,
  className,
  ...props
}: FormFieldProps) => {
  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (success) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (warning) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    if (info) return <Info className="h-4 w-4 text-blue-600" />;
    return null;
  };

  const getStatusMessage = () => {
    return error || success || warning || info;
  };

  const getStatusColor = () => {
    if (error) return "text-destructive";
    if (success) return "text-green-600";
    if (warning) return "text-yellow-600";
    if (info) return "text-blue-600";
    return "text-muted-foreground";
  };

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div className="relative">
        {children}
      </div>
      
      {getStatusMessage() && (
        <div className={cn("flex items-center gap-2 text-sm", getStatusColor())}>
          {getStatusIcon()}
          <span>{getStatusMessage()}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced input with validation states
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const ValidatedInput = ({
  label,
  description,
  error,
  success,
  warning,
  info,
  leftIcon,
  rightIcon,
  className,
  required,
  ...props
}: ValidatedInputProps) => {
  const hasStatus = error || success || warning || info;
  
  const getInputStyles = () => {
    if (error) return "border-destructive focus:border-destructive focus:ring-destructive";
    if (success) return "border-green-500 focus:border-green-500 focus:ring-green-500";
    if (warning) return "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500";
    if (info) return "border-blue-500 focus:border-blue-500 focus:ring-blue-500";
    return "";
  };

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      success={success}
      warning={warning}
      info={info}
      required={required}
    >
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        <Input
          className={cn(
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            getInputStyles(),
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
    </FormField>
  );
};

// Enhanced textarea with validation
interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  warning?: string;
  info?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const ValidatedTextarea = ({
  label,
  description,
  error,
  success,
  warning,
  info,
  showCharCount,
  maxLength,
  className,
  required,
  value,
  ...props
}: ValidatedTextareaProps) => {
  const getTextareaStyles = () => {
    if (error) return "border-destructive focus:border-destructive focus:ring-destructive";
    if (success) return "border-green-500 focus:border-green-500 focus:ring-green-500";
    if (warning) return "border-yellow-500 focus:border-yellow-500 focus:ring-yellow-500";
    if (info) return "border-blue-500 focus:border-blue-500 focus:ring-blue-500";
    return "";
  };

  const charCount = typeof value === 'string' ? value.length : 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.8;
  const isOverLimit = maxLength && charCount > maxLength;

  return (
    <FormField
      label={label}
      description={description}
      error={error}
      success={success}
      warning={warning}
      info={info}
      required={required}
    >
      <div className="relative">
        <Textarea
          className={cn(getTextareaStyles(), className)}
          maxLength={maxLength}
          value={value}
          {...props}
        />
        
        {showCharCount && maxLength && (
          <div className={cn(
            "absolute bottom-2 right-2 text-xs",
            isOverLimit ? "text-destructive" : 
            isNearLimit ? "text-yellow-600" : "text-muted-foreground"
          )}>
            {charCount}/{maxLength}
          </div>
        )}
      </div>
    </FormField>
  );
};