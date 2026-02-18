trigger OPP_OpportunityTrigger on Opportunity (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    OPP_BaseService_21.ServiceConfig config =
        new OPP_BaseService_21.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            OPP_Domain_28 domain =
                new OPP_Domain_28();
            OPP_Domain_28.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (OPP_Domain_28.ValidationError err : validation.errors) {
                    if (err.severity == OPP_Domain_28.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        OPP_RecordService_23 service =
            new OPP_RecordService_23();
        OPP_BaseService_21.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'OPP trigger error: ' + error);
            }
        }
    }
}
