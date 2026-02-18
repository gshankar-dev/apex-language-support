trigger BAT_OrderTrigger on Order (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    BAT_BaseService_781.ServiceConfig config =
        new BAT_BaseService_781.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            BAT_Domain_788 domain =
                new BAT_Domain_788();
            BAT_Domain_788.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (BAT_Domain_788.ValidationError err : validation.errors) {
                    if (err.severity == BAT_Domain_788.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        BAT_RecordService_783 service =
            new BAT_RecordService_783();
        BAT_BaseService_781.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'BAT trigger error: ' + error);
            }
        }
    }
}
