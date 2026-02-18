trigger OUT_EmailMessageTrigger on EmailMessage (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    OUT_BaseService_651.ServiceConfig config =
        new OUT_BaseService_651.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            OUT_Domain_658 domain =
                new OUT_Domain_658();
            OUT_Domain_658.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (OUT_Domain_658.ValidationError err : validation.errors) {
                    if (err.severity == OUT_Domain_658.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        OUT_RecordService_653 service =
            new OUT_RecordService_653();
        OUT_BaseService_651.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'OUT trigger error: ' + error);
            }
        }
    }
}
