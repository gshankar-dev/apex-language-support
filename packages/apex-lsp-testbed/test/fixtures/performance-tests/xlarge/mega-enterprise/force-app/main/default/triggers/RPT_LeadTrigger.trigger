trigger RPT_LeadTrigger on Lead (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    RPT_BaseService_201.ServiceConfig config =
        new RPT_BaseService_201.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            RPT_Domain_208 domain =
                new RPT_Domain_208();
            RPT_Domain_208.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (RPT_Domain_208.ValidationError err : validation.errors) {
                    if (err.severity == RPT_Domain_208.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        RPT_RecordService_203 service =
            new RPT_RecordService_203();
        RPT_BaseService_201.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'RPT trigger error: ' + error);
            }
        }
    }
}
