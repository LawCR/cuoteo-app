'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { ReactElement } from 'react';
import { createPlanAction } from '@/features/plans/actions/create-plan.action';
import { updatePlanAction } from '@/features/plans/actions/update-plan.action';
import { PlanCategoryIcon } from '@/features/plans/components/PlanCategoryIcon';
import {
  DEFAULT_PLAN_ICON,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_VALUES,
  PLAN_NAME_MAX_LENGTH,
} from '@/features/plans/constants/plans.constants';
import {
  planMetadataSchema,
  type TPlanMetadataFormData,
} from '@/features/plans/schemas/plan-metadata.schema';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

type TPlanMetadataFormProps =
  | {
      mode: 'create';
    }
  | {
      mode: 'edit';
      planId: string;
      defaultValues: TPlanMetadataFormData;
      readOnly: boolean;
    };

export function PlanMetadataForm(props: TPlanMetadataFormProps): ReactElement {
  const isEdit = props.mode === 'edit';
  const readOnly = isEdit && props.readOnly;

  const form = useForm<TPlanMetadataFormData>({
    resolver: zodResolver(planMetadataSchema),
    defaultValues: isEdit
      ? props.defaultValues
      : { name: '', icon: DEFAULT_PLAN_ICON },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: TPlanMetadataFormData): Promise<void> {
    if (props.mode === 'create') {
      const result = await createPlanAction(values);

      if (result.error) {
        toast.error(result.error);
      }

      return;
    }

    const result = await updatePlanAction({
      planId: props.planId,
      ...values,
    });

    if (result.error) {
      toast.error(result.error);
      return;
    }

    if (result.success) {
      toast.success('Plan actualizado');
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-4'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input
                  autoComplete='off'
                  maxLength={PLAN_NAME_MAX_LENGTH}
                  className='min-h-11'
                  placeholder='Viaje a Paracas'
                  disabled={readOnly || isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='icon'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ícono</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={readOnly || isSubmitting}
              >
                <FormControl>
                  <SelectTrigger className='min-h-11 w-full'>
                    <SelectValue placeholder='Elige un ícono' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENSE_CATEGORY_VALUES.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                    >
                      <div className='flex flex-row items-center gap-2'>
                        <PlanCategoryIcon category={category} />
                        {EXPENSE_CATEGORY_LABELS[category]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {readOnly ? (
                <FormDescription>
                  El nombre y el ícono se pueden cambiar cuando el plan está
                  activo.
                </FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        {readOnly ? null : (
          <Button
            type='submit'
            size='lg'
            disabled={isSubmitting}
            className='min-h-11 w-full sm:w-auto'
          >
            {isSubmitting
              ? isEdit
                ? 'Guardando…'
                : 'Creando…'
              : isEdit
                ? 'Guardar cambios'
                : 'Crear plan'}
          </Button>
        )}
      </form>
    </Form>
  );
}
