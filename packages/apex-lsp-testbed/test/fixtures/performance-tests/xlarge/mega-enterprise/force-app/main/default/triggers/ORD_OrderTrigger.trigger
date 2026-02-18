trigger ORD_OrderTrigger on Order (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ORD_BaseService_101.ServiceConfig config =
        new ORD_BaseService_101.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ORD_Domain_108 domain =
                new ORD_Domain_108();
            ORD_Domain_108.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ORD_Domain_108.ValidationError err : validation.errors) {
                    if (err.severity == ORD_Domain_108.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ORD_RecordService_103 service =
            new ORD_RecordService_103();
        ORD_BaseService_101.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ORD trigger error: ' + error);
            }
        }
    }
}
