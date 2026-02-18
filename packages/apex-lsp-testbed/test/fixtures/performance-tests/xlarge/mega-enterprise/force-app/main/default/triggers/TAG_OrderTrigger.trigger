trigger TAG_OrderTrigger on Order (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    TAG_BaseService_441.ServiceConfig config =
        new TAG_BaseService_441.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            TAG_Domain_448 domain =
                new TAG_Domain_448();
            TAG_Domain_448.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (TAG_Domain_448.ValidationError err : validation.errors) {
                    if (err.severity == TAG_Domain_448.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        TAG_RecordService_443 service =
            new TAG_RecordService_443();
        TAG_BaseService_441.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'TAG trigger error: ' + error);
            }
        }
    }
}
